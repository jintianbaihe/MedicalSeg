let wsObj = null
let wsUrl = null
let lockReconnect = false
let wsCreateHandler = null
let messageCallback = null
let errorCallback = null
let sendDatas = {}

export const connectWebsocket = (url, agentData, successCallback, errCallback) => {
  wsUrl = url
  createWebSoket()
  messageCallback = successCallback
  errorCallback = errCallback
  sendDatas = agentData
}

export const closeWebsocket = () => {
  if (wsObj) {
    writeToScreen('手动关闭websocket')
    wsObj.close() 
    lockReconnect = true
    wsCreateHandler && clearTimeout(wsCreateHandler)
    heartCheck.stop()
  }
}

const createWebSoket = () => {
  if (typeof (WebSocket) === 'undefined') {
    writeToScreen('您的浏览器不支持WebSocket，无法获取数据')
    return false
  }
  try {
    wsObj = new WebSocket(wsUrl)
    initWsEventHandle()
  } catch (e) {
    writeToScreen('连接异常，开始重连')
    reconnect()
  }
}

const initWsEventHandle = () => {
  try {
    wsObj.onopen = (event) => {
      onWsOpen(event)
    }

    wsObj.onmessage = (event) => {
      onWsMessage(event)
    }

    wsObj.onclose = (event) => {
      writeToScreen('onclose执行关闭事件')
      onWsClose(event)
    }

    wsObj.onerror = (event) => {
      writeToScreen('onerror执行error事件，开始重连')
      onWsError(event)
      reconnect()
    }
  } catch (err) {
    writeToScreen('绑定事件没有成功，开始重连')
    reconnect()
  }
}

const onWsOpen = (event) => {
  writeToScreen('CONNECT')
  if (wsObj.readyState === wsObj.OPEN) { // wsObj.OPEN = 1
    console.log('发送标识', sendDatas)
    wsObj.send(sendDatas)
  }
  if (wsObj.readyState === wsObj.CLOSED) { // wsObj.CLOSED = 3
    writeToScreen('wsObj.readyState=3, ws连接异常，开始重连')
    reconnect()
    errorCallback()
  }
}
const onWsMessage = (event) => {
  const jsonStr = event.data
  writeToScreen('onWsMessage接收到服务器的数据: ', jsonStr)
  messageCallback(jsonStr)
}
const onWsClose = (event) => {
  writeToScreen('DISCONNECT')
  console.log('onclose event: ', event)
  if (event && event.code !== 1000) {
    writeToScreen('非正常关闭')
    errorCallback()
    reconnect()
  }
}
const onWsError = (event) => {
  writeToScreen('onWsError: ', event.data)
  errorCallback()
}

const writeToScreen = (massage) => {
  console.log(massage)
}

const reconnect = () => {
  if (lockReconnect) {
    return
  }
  writeToScreen('3秒后重连')
  lockReconnect = true
  wsCreateHandler && clearTimeout(wsCreateHandler)
  wsCreateHandler = setTimeout(() => {
    writeToScreen('重连...' + wsUrl)
    createWebSoket()
    lockReconnect = false
    writeToScreen('重连完成')
  }, 3000)
}

const GetQueryString = (name) => {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  let r = window.location.search.substr(1).match(reg)
  let context = ''
  r && (context = r[2])
  reg = null
  r = null
  return context
}

const heartCheck = {
  timeout: 60000,
  timeoutObj: null,
  serverTimeoutObj: null,
  reset() {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
    this.start()
  },
  stop() {
    clearTimeout(this.timeoutObj)
    clearTimeout(this.serverTimeoutObj)
  },
  start() {
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(() => {
      writeToScreen('心跳检查，发送ping到后台')
      try {
        const datas = { ping: true }
        wsObj.send(JSON.stringify(datas))
      } catch (err) {
        writeToScreen('发送ping异常')
      }
      this.serverTimeoutObj = setTimeout(() => {
        writeToScreen('没有收到后台的数据，重新连接')
        reconnect()
      }, 100)
    }, this.timeout)
  }
}

