import axios from "./axios.js";

export function getOrganInfo(data) {
  return axios({
    url: "/getOrganInfo",
    method: "post",
    data: {
      data
    },
  })
}

export function getFocusInfo(fileId) {
  return axios({
    url: "/getFocusInfo",
    method: "post",
    data: {
      fileId
    },
  })
}

export function connectedArea(fileId,trueOrigin) {
  return axios({
    url: "/connectedArea",
    method: "post",
    data: {
      fileId,trueOrigin
    },
  })
}
