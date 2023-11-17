<template>
  <div>
    <div style="" class="ace-editor" ref="ace"></div>

    <v-btn
      @click="clearCodeRes"
      :style="{ color: theme === true ? '#E8EAF6' : '' }"
      :dark="!theme"
      style="float: left; margin: 10px"
    >
      <v-icon size="15">mdi-delete-variant</v-icon>&nbsp; 清空结果记录
    </v-btn>
    <v-btn
      @click="runCode"
      :style="{ color: theme === true ? '#E8EAF6' : '' }"
      :dark="!theme"
      style="float: left; margin: 10px 0"
    >
      <v-icon>mdi-menu-right</v-icon> 运行脚本
    </v-btn>
  </div>
</template>

<script>
import ace from "ace-builds";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/theme-eclipse";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/ext-language_tools";
import { mapState, mapActions } from "vuex";
import { getOrganInfo } from "@/plugins/api";

export default {
  name: "AceEditor",

  data() {
    return {
      aceEditor: null,
      themePath: "ace/theme/eclipse",
      modePath: "ace/mode/javascript",
      sourceNameArr: [],
      labelNameArr: [],
    };
  },
  computed: {
    ...mapState("widgets", ["imageToLabelmaps"]),
    ...mapState("view", ["analyzeData"]),
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
  },
  mounted() {
    var languageTools = ace.require("ace/ext/language_tools");
    const sources = this.$proxyManager
      .getSources()
      .filter(
        (s) =>
          s.getProxyGroup() === "Sources" &&
          s.getProxyName() === "TrivialProducer"
      )
      .filter((s) => Boolean(s.getDataset()));
    for (let i = 0; i < sources.length; i++) {
      let sourceName = sources[i].getName();
      if (!this.sourceNameArr.includes(sourceName)) {
        this.sourceNameArr.push(sourceName);
        languageTools.addCompleter({
          getCompletions: function (editor, session, pos, prefix, callback) {
            callback(null, [
              {
                name: sourceName,
                value: sourceName,
                caption: sourceName,
                meta: "sourceName",
                type: "local",
              },
            ]);
          },
        });
      }
    }
    languageTools.addCompleter({
      getCompletions: function (editor, session, pos, prefix, callback) {
        callback(null, [
          {
            name: "getLabelInfo",
            value: "getLabelInfo",
            caption: "getLabelInfo",
            meta: "getLabelInfo",
            type: "local",
            score: 1000,
          },
          {
            name: "getOrgCnt",
            value: "getOrgCnt",
            caption: "getOrgCnt",
            meta: "getOrgCnt",
            type: "local",
            score: 1000,
          },
          {
            name: "脾脏",
            value: "脾脏",
            caption: "脾脏",
            meta: "labelName",
            type: "local",
          },
          {
            name: "右肾",
            value: "右肾",
            caption: "右肾",
            meta: "labelName",
            type: "local",
          },
          {
            name: "左肾",
            value: "左肾",
            caption: "左肾",
            meta: "labelName",
            type: "local",
          },
          {
            name: "胆囊",
            value: "胆囊",
            caption: "胆囊",
            meta: "labelName",
            type: "local",
          },
          {
            name: "食道",
            value: "食道",
            caption: "食道",
            meta: "labelName",
            type: "local",
          },
          {
            name: "肝",
            value: "肝",
            caption: "肝",
            meta: "labelName",
            type: "local",
          },
          {
            name: "胃",
            value: "胃",
            caption: "胃",
            meta: "labelName",
            type: "local",
          },
          {
            name: "主动脉",
            value: "主动脉",
            caption: "主动脉",
            meta: "labelName",
            type: "local",
          },
          {
            name: "下腔静脉",
            value: "下腔静脉",
            caption: "下腔静脉",
            meta: "labelName",
            type: "local",
          },
          {
            name: "胰腺",
            value: "胰腺",
            caption: "胰腺",
            meta: "labelName",
            type: "local",
          },
          {
            name: "右肾上腺",
            value: "右肾上腺",
            caption: "右肾上腺",
            meta: "labelName",
            type: "local",
          },
          {
            name: "左肾上腺",
            value: "左肾上腺",
            caption: "左肾上腺",
            meta: "labelName",
            type: "local",
          },
          {
            name: "十二指肠",
            value: "十二指肠",
            caption: "十二指肠",
            meta: "labelName",
            type: "local",
          },
          {
            name: "膀胱",
            value: "膀胱",
            caption: "膀胱",
            meta: "labelName",
            type: "local",
          },
          {
            name: "前列腺/子宫",
            value: "前列腺/子宫",
            caption: "前列腺/子宫",
            meta: "labelName",
            type: "local",
          },
          {
            name: "x直径",
            value: "x直径",
            caption: "x直径",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "y直径",
            value: "y直径",
            caption: "y直径",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "z直径",
            value: "z直径",
            caption: "z直径",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "x面积",
            value: "x面积",
            caption: "x面积",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "y面积",
            value: "y面积",
            caption: "y面积",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "z面积",
            value: "z面积",
            caption: "z面积",
            meta: "measureObj",
            type: "local",
          },
          {
            name: "体积",
            value: "体积",
            caption: "体积",
            meta: "measureObj",
            type: "local",
          },
        ]);
      },
    });
    this.aceEditor = ace.edit(this.$refs.ace, {
      maxLines: 20,
      minLines: 10,
      fontSize: 14,
      theme: this.themePath,
      mode: this.modePath,
      tabSize: 4,
    });
    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });
    this.aceEditor.resize();
  },
  proxyManagerHooks: {
    onProxyCreated({ proxy, proxyId, proxyGroup, proxyName }) {
      if (proxyGroup === "Sources" && proxyName === "TrivialProducer") {
        var languageTools = ace.require("ace/ext/language_tools");
        let sourceName = this.$proxyManager.getProxyById(proxyId).getName();
        if (!this.sourceNameArr.includes(sourceName)) {
          this.sourceNameArr.push(sourceName);
          languageTools.addCompleter({
            getCompletions: function (editor, session, pos, prefix, callback) {
              callback(null, [
                {
                  name: sourceName,
                  value: sourceName,
                  caption: sourceName,
                  meta: "sourceName",
                  type: "local",
                },
              ]);
            },
          });
        }
      }
      if (proxyGroup === "Sources" && proxyName === "LabelMap") {
      }
    },
  },
  methods: {
    getSourceId(sourceName) {
      const source = this.$proxyManager
        .getSources()
        .filter(
          (s) =>
            s.getProxyGroup() === "Sources" &&
            s.getProxyName() === "TrivialProducer"
        )
        .filter((s) => Boolean(s.getDataset()) && s.getName() == sourceName);
      return source[0];
    },
    getLabelId(sourceId, labelName) {
      const label = this.imageToLabelmaps[sourceId].filter(
        (s) => this.$proxyManager.getProxyById(s).getName() == labelName
      );
      // getOrgCnt("5_raw.nii.gz","标签集16")
      return label[0];
    },
    getOrgCnt(sName, labelName) {
      let source = this.getSourceId(sName);
      let label = this.$proxyManager.getProxyById(
        this.getLabelId(source.getProxyId(), labelName)
      );
      console.log(label);
      let organCnt = [];
      if (this.analyzeData[source.getProxyId()]) {
        organCnt = this.analyzeData[source.getProxyId()].filter(
          (s) => s.labelName == labelName
        );
      }

      if (organCnt.length == 0) {
        if (label.getKey("isChanged")) {
          let postData = {
            fileId: "570abf4f-1b8b-3c03-a229-473dde1b6553",
            isChanged: true,
            labelmapId: label.getProxyId(),
            scalarArr: label.getDataset().getPointData().getScalars().toJSON(),
          };
          console.log(postData);

          getOrganInfo(postData).then((res) => {
            console.log(res);
            let labelName = label.getName();
            let labelValue = res.data.data;
            labelValue.labelName = labelName;
            labelValue.labelmapId = label.getProxyId();
            this.setAnalyzeData(source.getProxyId(), labelValue);
            label.setKey("isChanged", false);
            let codeData = {
              title: sName + "  " + labelName + "  器官数量: ",
              value: labelValue.connectivityCnt,
            };
            this.setCodeData(codeData);
            this.$proxyManager.renderAllViews();
          });
        } else {
          let postData = {
            fileId:
              label.getKey("labeldd") +
              "-" +
              "570abf4f-1b8b-3c03-a229-473dde1b6553",
            isChanged: false,
            labelmapId: label.getProxyId(),
            scalarArr: [],
          };
          getOrganInfo(postData).then((res) => {
            let labelName = label.getName();
            let labelValue = res.data.data;
            labelValue.labelName = labelName;
            labelValue.labelmapId = label.getProxyId();
            this.setAnalyzeData(source.getProxyId(), labelValue);
            label.setKey("isChanged", false);
            let codeData = {
              title: sName + "  " + labelName + "  器官数量: ",
              value: labelValue.connectivityCnt,
            };
            this.setCodeData(codeData);
          });
        }
      } else {
        let codeData = {
          title: sName + "  " + labelName + "  器官数量: ",
          value: organCnt[0].connectivityCnt,
        };
        this.setCodeData(codeData);
      }
    },
    getLabelInfo(sName, labelName, measureObj) {
      let source = this.getSourceId(sName);
      let label = this.$proxyManager.getProxyById(
        this.getLabelId(source.getProxyId(), labelName)
      );
      console.log(label);
      let organCnt = [];
      if (this.analyzeData[source.getProxyId()]) {
        organCnt = this.analyzeData[source.getProxyId()].filter(
          (s) => s.labelName == labelName
        );
      }

      if (organCnt.length == 0) {
        if (label.getKey("isChanged")) {
          let postData = {
            fileId: "570abf4f-1b8b-3c03-a229-473dde1b6553",
            isChanged: true,
            labelmapId: label.getProxyId(),
            scalarArr: label.getDataset().getPointData().getScalars().toJSON(),
          };
          console.log(postData);

          getOrganInfo(postData).then((res) => {
            console.log(res);
            let labelName = label.getName();
            let labelValue = res.data.data;
            labelValue.labelName = labelName;
            labelValue.labelmapId = label.getProxyId();
            this.setAnalyzeData(source.getProxyId(), labelValue);
            label.setKey("isChanged", false);
            let value = "";
            for (let i = 0; i < measureObj.length; i++) {
              if (measureObj[i] == "x直径") {
                value += "x直径: " + organCnt[0].x[1] + "毫米,  ";
              } else if (measureObj[i] == "y直径") {
                value += "y直径: " + organCnt[0].y + "毫米,  ";
              } else if (measureObj[i] == "z直径") {
                value += "z直径: " + organCnt[0].z + "毫米,  ";
              } else if (measureObj[i] == "x面积") {
                value += "x面积:" + organCnt[0].yz + "平方毫米,  ";
              } else if (measureObj[i] == "y面积") {
                value += "y面积: " + organCnt[0].xz + "平方毫米,  ";
              } else if (measureObj[i] == "z面积") {
                value += "z面积: " + organCnt[0].xy + "平方毫米,  ";
              } else if (measureObj[i] == "体积") {
                value += "体积: " + organCnt[0].volume + "立方毫米,  ";
              }
            }
            let codeData = {
              title: sName + "  " + labelName + "  标签信息: ",
              value: value,
            };

            this.setCodeData(codeData);
            this.$proxyManager.renderAllViews();
          });
        } else {
          let postData = {
            fileId:
              label.getKey("labeldd") +
              "-" +
              "570abf4f-1b8b-3c03-a229-473dde1b6553",
            isChanged: false,
            labelmapId: label.getProxyId(),
            scalarArr: [],
          };
          getOrganInfo(postData).then((res) => {
            let labelName = label.getName();
            let labelValue = res.data.data;
            labelValue.labelName = labelName;
            labelValue.labelmapId = label.getProxyId();
            this.setAnalyzeData(source.getProxyId(), labelValue);
            label.setKey("isChanged", false);
            let value = "";
            for (let i = 0; i < measureObj.length; i++) {
              if (measureObj[i] == "x直径") {
                value += "x直径：" + organCnt[0].x + ",  ";
              } else if (measureObj[i] == "y直径") {
                value += "y直径：" + organCnt[0].y + ",  ";
              } else if (measureObj[i] == "z直径") {
                value += "z直径：" + organCnt[0].z + ",  ";
              } else if (measureObj[i] == "x面积") {
                value += "x面积" + organCnt[0].yz + ",  ";
              } else if (measureObj[i] == "y面积") {
                value += "y面积" + organCnt[0].xz + ",  ";
              } else if (measureObj[i] == "z面积") {
                value += "z面积" + organCnt[0].xy + ",  ";
              } else if (measureObj[i] == "体积") {
                value += "体积" + organCnt[0].volume + ",  ";
              }
            }
            let codeData = {
              title: sName + "  " + labelName + "  标签参数信息: ",
              value: value,
            };

            this.setCodeData(codeData);
          });
        }
      } else {
        let value = "";
        for (let i = 0; i < measureObj.length; i++) {
          if (measureObj[i] == "x直径") {
            value += "x直径：" + organCnt[0].x + ",  ";
          } else if (measureObj[i] == "y直径") {
            value += "y直径：" + organCnt[0].y + ",  ";
          } else if (measureObj[i] == "z直径") {
            value += "z直径：" + organCnt[0].z + ",  ";
          } else if (measureObj[i] == "x面积") {
            value += "x面积" + organCnt[0].yz + ",  ";
          } else if (measureObj[i] == "y面积") {
            value += "y面积" + organCnt[0].xz + ",  ";
          } else if (measureObj[i] == "z面积") {
            value += "z面积" + organCnt[0].xy + ",  ";
          } else if (measureObj[i] == "体积") {
            value += "体积" + organCnt[0].volume + ",  ";
          }
        }
        let codeData = {
          title: sName + "  " + labelName + "  标签参数信息: ",
          value: value,
        };

        this.setCodeData(codeData);
      }
    },
    clearCodeRes() {
      this.clearCodeData();
    },
    runCode() {
      let that = this;
      function getOrgCnt(sName, labelName) {
        that.getOrgCnt(sName, labelName);
      }
      function getLabelInfo(sName, labelName, measureObj) {
        that.getLabelInfo(sName, labelName, measureObj);
      }
      eval(this.aceEditor.getValue());
    },
    ...mapActions("view", ["setCodeData", "clearCodeData"]),
  },
};
</script>

<style lang="scss" scoped>
</style>