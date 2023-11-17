<template>
  <div>
    <!-- <SourceSelect
      style="width: 100%"
      label="选择数据集"
      :filterFunc="filterImageData"
      bindToActiveSource
      @input="setTargetVolume"
    /> -->
    <div id="fourteenth-element-introduction">
      <div
        style="flex-direction: column; padding: 10px; margin-top: -20px"
        class="flex flex-middle"
      >
        <v-checkbox
          class="flex flex-middle slimInput"
          v-model="isAnalyzeFocus"
          style="margin: 15px 0; width: 100%"
          hide-details
          color="indigo"
          label=" 分析病灶（肾癌、肝癌、肠癌）"
        />
        <v-btn
          @click="analyze"
          :dark="!theme"
          :style="{ color: theme === true ? '#E8EAF6' : '' }"
          :loading="loading"
          :disabled="targetImageId === -1"
          style="width: 100%"
        >
          <v-icon :style="{ color: theme === true ? '#303F9F' : '' }">mdi-chart-bar</v-icon>
          &nbsp;分析 &nbsp;
        </v-btn>
      </div>
      <!-- <div
        style="flex-direction: column; margin-bottom: 20px; padding: 10px"
        class="flex flex-middle"
      >
        <v-btn
          @click="statistic"
          color="#E8EAF6"
          :dark="!theme"
          :loading="loading"
          :disabled="targetImageId === -1"
          style="width: 100%"
        >
          <v-icon color="#303F9F">mdi-chart-box</v-icon>
          统计结果展示
        </v-btn>
      </div> -->
    </div>

    <v-card  id="fifteenth-element-introduction">
      <v-card-title style="font-size: 16px">后处理脚本</v-card-title>
      <v-card-text>
        <el-table :data="tableData" border size="mini" style="font-size: 12px">
          <el-table-column prop="funName" label="函数名">
            <template slot-scope="scope">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">{{ scope.row.funName[0] }}</div>
                </template>
                <span>{{ scope.row.funName[1] }}</span>
                <br />
                <span>{{ scope.row.funName[2] }}</span>
              </v-tooltip>
            </template>
          </el-table-column>

          <el-table-column prop="inputData" label="参数">
            <template slot-scope="scope">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <div v-for="item in scope.row.inputData">
                      {{ item.name }}
                    </div>
                  </div>
                </template>
                <span v-for="item in scope.row.inputData"
                  >{{ item.info }}<br
                /></span>
              </v-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="resData" label="返回">
            <template slot-scope="scope">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    {{ scope.row.resData.name }}
                  </div>
                </template>
                <span>{{ scope.row.resData.info }}</span>
              </v-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </v-card-text>

      <AceEditor></AceEditor>
    </v-card>
    <v-card
    :dark="!theme"
      style="margin-top: 60px; padding-bottom: 20px"
      v-if="codeData.length > 0"
    >
      <v-card-title style="font-size: 14px; font-weight: normal; color: #666"
        >脚本处理结果记录</v-card-title
      >
      <v-card-text>
        <div v-for="item in codeData">
          <div>
            {{ item.title }}

            <span style="color: #3d5afe">
              {{ item.value }}
            </span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import SourceSelect from "../Tools/SourceSelect";
import { mapActions, mapState } from "vuex";
import AceEditor from "../AceEditor";
import { getOrganInfo, getFocusInfo } from "@/plugins/api";
import { createLabelMapFromImage, fromHex } from "../../store/fileLoader";
export default {
  name: "Statistic",

  data() {
    return {
      loading: false,
      targetImageName: "",
      tableData: [
        {
          funName: [
            "getOrgCnt",
            "获取器官数量",
            '例: getOrgCnt("spleen_8.nii.gz","肝脏")',
          ],
          inputData: [
            { name: "sName", info: "sName: 数据集名称(String)" },
            { name: "labelName", info: "labelName: 标签的名称(String)" },
          ],
          resData: { name: "OrganCnt", info: "OrganCnt: 器官数量(Int)" },
        },
        {
          funName: [
            "getLabelInfo",
            "获取标签指定信息",
            '例: getLabelInfo("spleen_8.nii.gz","肝脏",["x直径","体积"])',
          ],
          inputData: [
            { name: "sName", info: "sName: 数据集名称(String)" },
            { name: "labelName", info: "labelName: 标签的名称(String)" },
            {
              name: "measureObj",
              info: "measureObj: 测量对象(String数组)，可选参数（x直径,y直径,z直径,x面积,y面积,z面积,体积）",
            },
          ],
          resData: { name: "measure", info: "测量结果(对象数组)" },
        },
      ],
    };
  },
  components: {
    SourceSelect,
    AceEditor,
  },

  computed: {
    ...mapState("widgets", ["imageToLabelmaps"]),
    ...mapState("view", [
      "barOption",
      "codeData",
      "analyzeData",
      "showStatistic",
      "showAnalyze",
    ]),
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    ...mapState("files", {
      files(state) {
        return state.files;
      },
      targetImageId(state) {
        return state.activeSourceId;
      },
    }),
    isAnalyzeFocus: {
      get() {
        return this.$store.state.view.isAnalyzeFocus;
      },
      set(val) {
        this.setIsAnalyzeFocusData(val);
      },
    },
  },
  methods: {
    filterImageData(source) {
      return (
        source.getProxyName() === "TrivialProducer" &&
        source.getType() === "vtkImageData"
      );
    },
    setTargetVolume(sourceId) {
      this.targetImageId = sourceId;
      this.targetImageName = this.$proxyManager
        .getProxyById(this.targetImageId)
        .getName();
    },
    getScalarArr(scalarData) {
      let numindex = scalarData.indexOf(1);
      let scalarArr = [];
      let scalarDataLen = scalarData.length;
      let tempIndex = numindex;
      let zeroOrone = 0;
      for (let i = numindex; i < scalarDataLen - 1 && i != -1; i = tempIndex) {
        numindex = scalarData.slice(i).indexOf(zeroOrone);
        if (numindex == -1) break;
        if (zeroOrone == 1) zeroOrone = 0;
        else {
          zeroOrone = 1;
          scalarArr.push([tempIndex, numindex + tempIndex - 1]);
        }
        tempIndex = numindex + i;
      }
      return scalarArr;
    },
    postScalarArr(spacing, dimension, id, scalarData) {
      let scalarArr = this.getScalarArr(scalarData);
      let postData = {
        spacing: spacing,
        dimension: dimension,
        labelmapId: id,
        scalarArr: scalarArr,
      };
      getOrganInfo(postData).then((res) => {});
    },
    statistic() {
      this.setShowAnalyze(false);
      const sources = this.$proxyManager
        .getSources()
        .filter(
          (s) =>
            s.getProxyGroup() === "Sources" &&
            s.getProxyName() === "TrivialProducer"
        )
        .filter((s) => Boolean(s.getDataset()));
      let datasets = sources.map((s) => s.getProxyId());
      if (datasets.length) {
        datasets.forEach((sourceId) => {
          console.log(sourceId);
          if (this.imageToLabelmaps[sourceId]) {
            this.imageToLabelmaps[sourceId].map((id, index) => {
              if (this.$proxyManager.getProxyById(id).getKey("isChanged")) {
                let postData = {
                  fileId: this.files[sourceId].fileId,
                  isChanged: true,
                  labelmapId: id,
                  scalarArr: this.$proxyManager
                    .getProxyById(this.imageToLabelmaps[sourceId][0])
                    .getDataset()
                    .getPointData()
                    .getScalars()
                    .toJSON(),
                };
                setTimeout(
                  getOrganInfo(postData).then((res) => {
                    let labelName = this.$proxyManager
                      .getProxyById(id)
                      .getName();
                    let labelValue = res.data.data;
                    labelValue.labelName = labelName;
                    labelValue.labelmapId = id;
                    this.setAnalyzeData(sourceId, labelValue);
                    this.setShowStatistic(true);
                  }),
                  100
                );
                this.$proxyManager.renderAllViews();
              } else {
                if (
                  this.analyzeData[sourceId] &&
                  this.analyzeData[sourceId].filter(
                    (s) => s.labelmapId == id
                  ) != []
                ) {
                  this.setShowStatistic(true);

                  let s = this.analyzeData[sourceId].filter(
                    (s) => s.labelmapId == id
                  );
                  let postData = {
                    fileId:
                      this.$proxyManager.getProxyById(id).getKey("labeldd") +
                      "-" +
                      this.files[sourceId].fileId,
                    isChanged: false,
                    labelmapId: id,
                    scalarArr: [],
                  };
                  getOrganInfo(postData).then((res) => {
                    let labelName = this.$proxyManager
                      .getProxyById(id)
                      .getName();
                    let labelValue = res.data.data;
                    labelValue.labelName = labelName;
                    labelValue.labelmapId = id;
                  });
                } else {
                  let postData = {
                    fileId:
                      this.$proxyManager.getProxyById(id).getKey("labeldd") +
                      "-" +
                      this.files[sourceId].fileId,
                    isChanged: false,
                    labelmapId: id,
                    scalarArr: [],
                  };
                  getOrganInfo(postData).then((res) => {
                    let labelName = this.$proxyManager
                      .getProxyById(id)
                      .getName();
                    let labelValue = res.data.data;
                    labelValue.labelName = labelName;
                    labelValue.labelmapId = id;
                    this.setAnalyzeData(sourceId, labelValue);
                    this.setShowStatistic(true);
                  });
                }
                this.$proxyManager.getProxyById(id).setKey("isChanged", false);
              }
            });
          } else {
          this.setShowStatistic(true);
          // }
          // if (this.isAnalyzeFocus) {
          //   getFocusInfo(this.files[sourceId].fileId).then((res) => {
          //     console.log(res);
          //     // this.setShowStatistic(true);

          //     let option = {
          //       xAxis: {
          //         name: "病灶",
          //         data: ["肾癌", "肝癌", "肠癌"],
          //         axisLabel: {
          //           interval: 0,
          //         },
          //       },
          //       yAxis: {
          //         name: "病灶数量",
          //       },
          //       tooltip: {
          //         trigger: "axis",
          //         axisPointer: {
          //           type: "shadow",
          //         },
          //       },
          //       toolbox: {
          //         show: true,
          //         feature: {
          //           dataView: { show: true, readOnly: false },
          //           saveAsImage: { show: true },
          //         },
          //       },
          //       series: [
          //         {
          //           type: "bar",
          //           data: [
          //             res.data.kidney.count,
          //             res.data.liver.count,
          //             res.data.colon.count,
          //           ],
          //         },
          //       ],
          //     };
          //     const chartBox = this.$echarts.init(
          //       document.getElementById("focusbar_statistic")
          //     );
          //     chartBox.setOption(option);
          //     chartBox.resize();
          //     window.addEventListener("resize", function () {
          //       chartBox.resize();
          //     });
          //     let option2 = {
          //       title: {
          //         subtext: "病灶直径体积分布",
          //       },
          //       grid: {
          //         left: "3%",
          //         right: "7%",
          //         bottom: "7%",
          //         containLabel: true,
          //       },
          //       tooltip: {
          //         showDelay: 0,
          //         formatter: function (params) {
          //           if (params.value.length > 1) {
          //             return (
          //               params.seriesName +
          //               " :<br/>" +
          //               params.value[0] +
          //               "mm " +
          //               params.value[1] +
          //               "cm3 "
          //             );
          //           } else {
          //             return (
          //               params.seriesName +
          //               " :<br/>" +
          //               params.name +
          //               " : " +
          //               params.value +
          //               "cm3"
          //             );
          //           }
          //         },
          //         axisPointer: {
          //           show: true,
          //           type: "cross",
          //           lineStyle: {
          //             type: "dashed",
          //             width: 1,
          //           },
          //         },
          //       },
          //       toolbox: {
          //         feature: {
          //           dataZoom: {},
          //           brush: {
          //             type: ["rect", "polygon", "clear"],
          //           },
          //         },
          //       },
          //       brush: {},
          //       legend: {
          //         data: ["肾癌", "肝癌", "肠癌"],
          //         left: "center",
          //         bottom: 5,
          //       },
          //       xAxis: [
          //         {
          //           name: "直径",
          //           type: "value",
          //           scale: true,
          //           axisLabel: {
          //             formatter: "{value} mm",
          //           },
          //           splitLine: {
          //             show: false,
          //           },
          //         },
          //       ],
          //       yAxis: [
          //         {
          //           name: "体积",
          //           type: "value",
          //           scale: true,
          //           axisLabel: {
          //             formatter: "{value} cm3",
          //           },
          //           splitLine: {
          //             show: false,
          //           },
          //         },
          //       ],
          //       series: [
          //         {
          //           name: "肾癌",
          //           type: "scatter",
          //           emphasis: {
          //             focus: "series",
          //           },
          //           data: res.data.kidney.infoList,
          //           markArea: {
          //             silent: true,
          //             itemStyle: {
          //               color: "transparent",
          //               borderWidth: 1,
          //               borderType: "dashed",
          //             },
          //             data: [
          //               [
          //                 {
          //                   name: "Female Data Range",
          //                   xAxis: "min",
          //                   yAxis: "min",
          //                 },
          //                 {
          //                   xAxis: "max",
          //                   yAxis: "max",
          //                 },
          //               ],
          //             ],
          //           },
          //         },
          //         {
          //           name: "肝癌",
          //           type: "scatter",
          //           emphasis: {
          //             focus: "series",
          //           },
          //           data: res.data.liver.infoList,
          //           markArea: {
          //             silent: true,
          //             itemStyle: {
          //               color: "transparent",
          //               borderWidth: 1,
          //               borderType: "dashed",
          //             },
          //             data: [
          //               [
          //                 {
          //                   name: "Male Data Range",
          //                   xAxis: "min",
          //                   yAxis: "min",
          //                 },
          //                 {
          //                   xAxis: "max",
          //                   yAxis: "max",
          //                 },
          //               ],
          //             ],
          //           },
          //         },
          //         {
          //           name: "肠癌",
          //           type: "scatter",
          //           emphasis: {
          //             focus: "series",
          //           },
          //           data: res.data.colon.infoList,
          //           markArea: {
          //             silent: true,
          //             itemStyle: {
          //               color: "transparent",
          //               borderWidth: 1,
          //               borderType: "dashed",
          //             },
          //             data: [
          //               [
          //                 {
          //                   name: "Male Data Range",
          //                   xAxis: "min",
          //                   yAxis: "min",
          //                 },
          //                 {
          //                   xAxis: "max",
          //                   yAxis: "max",
          //                 },
          //               ],
          //             ],
          //           },
          //         },
          //       ],
          //     };
          //     const chartBox2 = this.$echarts.init(
          //       document.getElementById("focuspie_statistic")
          //     );
          //     chartBox2.setOption(option2);
          //     chartBox2.resize();
          //     window.addEventListener("resize", function () {
          //       chartBox2.resize();
          //     });
          //   });
          }
        });
      }
    },
    analyze() {
      console.log(this.showStatistic, this.showAnalyze);
      this.setShowStatistic(false);
      this.setAnalyzeTargetId(this.targetImageId);
      let xAxisData = [];
      let yAxisData = [];
      if (this.imageToLabelmaps[this.targetImageId]) {
        this.imageToLabelmaps[this.targetImageId].map((id, index) => {
          if (
            this.$proxyManager.getProxyById(id).getKey("inferObj") == "器官"
          ) {
            if (this.$proxyManager.getProxyById(id).getKey("isChanged")) {
              let postData = {
                fileId: this.files[this.targetImageId].fileId,
                isChanged: true,
                labelmapId: id,
                scalarArr: this.$proxyManager
                  .getProxyById(this.imageToLabelmaps[this.targetImageId][0])
                  .getDataset()
                  .getPointData()
                  .getScalars()
                  .toJSON(),
              };
              setTimeout(
                getOrganInfo(postData).then((res) => {
                  let labelName = this.$proxyManager.getProxyById(id).getName();
                  let labelValue = res.data.data;
                  labelValue.labelName = labelName;
                  labelValue.labelmapId = id;
                  xAxisData.push(labelName);
                  yAxisData.push(labelValue.connectivityCnt);
                  if (
                    index ==
                    this.imageToLabelmaps[this.targetImageId].length - 1
                  ) {
                    this.setBarOption(xAxisData, yAxisData);
                    const chartBox = this.$echarts.init(
                      document.getElementById("maychar")
                    );

                    chartBox.setOption(this.barOption);
                    chartBox.resize();

                    window.addEventListener("resize", function () {
                      chartBox.resize();
                    });
                  }
                  this.setAnalyzeData(this.targetImageId, labelValue);
                  this.setShowAnalyze(true);
                }),
                100
              );
              this.$proxyManager.renderAllViews();
            } else {
              if (
                this.analyzeData[this.targetImageId] &&
                this.analyzeData[this.targetImageId].filter(
                  (s) => s.labelmapId == id
                ) != []
              ) {
                this.setShowAnalyze(true);

                let s = this.analyzeData[this.targetImageId].filter(
                  (s) => s.labelmapId == id
                );
                let postData = {
                  fileId:
                    this.$proxyManager.getProxyById(id).getKey("labeldd") +
                    "-" +
                    this.files[this.targetImageId].fileId,
                  isChanged: false,
                  labelmapId: id,
                  scalarArr: [],
                };
                getOrganInfo(postData).then((res) => {
                  let labelName = this.$proxyManager.getProxyById(id).getName();
                  let labelValue = res.data.data;
                  labelValue.labelName = labelName;
                  labelValue.labelmapId = id;
                  xAxisData.push(labelName);
                  yAxisData.push(labelValue.connectivityCnt);
                  if (
                    index ==
                    this.imageToLabelmaps[this.targetImageId].length - 1
                  ) {
                    this.setBarOption(xAxisData, yAxisData);
                    let option = {
                      xAxis: {
                        name: "标签名称",
                        data: xAxisData,
                        axisLabel: {
                          interval: 0,
                        },
                      },
                      yAxis: {
                        name: "器官数量",
                      },
                      tooltip: {
                        trigger: "axis",
                        axisPointer: {
                          type: "shadow",
                        },
                      },
                      toolbox: {
                        show: true,
                        feature: {
                          dataView: { show: true, readOnly: false },
                          saveAsImage: { show: true },
                        },
                      },
                      series: [
                        {
                          type: "bar",
                          data: yAxisData,
                        },
                      ],
                    };
                    const chartBox = this.$echarts.init(
                      document.getElementById("maychar")
                    );

                    chartBox.setOption(option);
                    chartBox.resize();

                    window.addEventListener("resize", function () {
                      chartBox.resize();
                    });
                  }
                });
              } else {
                let postData = {
                  fileId:
                    this.$proxyManager.getProxyById(id).getKey("labeldd") +
                    "-" +
                    this.files[this.targetImageId].fileId,
                  isChanged: false,
                  labelmapId: id,
                  scalarArr: [],
                };
                getOrganInfo(postData).then((res) => {
                  let labelName = this.$proxyManager.getProxyById(id).getName();
                  let labelValue = res.data.data;
                  labelValue.labelName = labelName;
                  labelValue.labelmapId = id;
                  this.setAnalyzeData(this.targetImageId, labelValue);
                  xAxisData.push(labelName);
                  yAxisData.push(labelValue.connectivityCnt);
                  if (
                    index ==
                    this.imageToLabelmaps[this.targetImageId].length - 1
                  ) {
                    this.setBarOption(xAxisData, yAxisData);
                    let option = {
                      xAxis: {
                        name: "标签名称",
                        data: xAxisData,
                        axisLabel: {
                          interval: 0,
                        },
                      },
                      yAxis: {
                        name: "器官数量",
                      },
                      toolbox: {
                        show: true,
                        feature: {
                          dataView: { show: true, readOnly: false },
                          saveAsImage: { show: true },
                        },
                      },
                      tooltip: {
                        trigger: "axis",
                        axisPointer: {
                          type: "shadow",
                        },
                      },
                      series: [
                        {
                          type: "bar",
                          data: yAxisData,
                        },
                      ],
                    };
                    const chartBox = this.$echarts.init(
                      document.getElementById("maychar")
                    );

                    chartBox.setOption(option);
                    chartBox.resize();

                    window.addEventListener("resize", function () {
                      chartBox.resize();
                    });
                  }

                  this.setShowAnalyze(true);
                });
              }
              this.$proxyManager.getProxyById(id).setKey("isChanged", false);
            }
          }
        });
      } else {
        this.setShowAnalyze(true);
      }
      console.log(this.isAnalyzeFocus);
      if (this.isAnalyzeFocus) {
        console.log(111);
        getFocusInfo(this.files[this.targetImageId].fileId).then((res) => {
          console.log(res);
          let option = {
            xAxis: {
              name: "病灶",
              data: ["肾癌", "肝癌", "肠癌"],
              axisLabel: {
                interval: 0,
              },
            },
            yAxis: {
              name: "病灶数量",
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow",
              },
            },
            toolbox: {
              show: true,
              feature: {
                dataView: { show: true, readOnly: false },
                saveAsImage: { show: true },
              },
            },
            series: [
              {
                type: "bar",
                data: [
                  res.data.kidney.count,
                  res.data.liver.count,
                  res.data.colon.count,
                ],
              },
            ],
          };
          const chartBox = this.$echarts.init(
            document.getElementById("focusbar")
          );
          chartBox.setOption(option);
          chartBox.resize();
          window.addEventListener("resize", function () {
            chartBox.resize();
          });
          let option2 = {
            title: {
              subtext: "病灶直径体积分布",
            },
            grid: {
              left: "3%",
              right: "7%",
              bottom: "7%",
              containLabel: true,
            },
            tooltip: {
              showDelay: 0,
              formatter: function (params) {
                if (params.value.length > 1) {
                  return (
                    params.seriesName +
                    " :<br/>" +
                    params.value[0] +
                    "mm " +
                    params.value[1] +
                    "cm3 "
                  );
                } else {
                  return (
                    params.seriesName +
                    " :<br/>" +
                    params.name +
                    " : " +
                    params.value +
                    "cm3"
                  );
                }
              },
              axisPointer: {
                show: true,
                type: "cross",
                lineStyle: {
                  type: "dashed",
                  width: 1,
                },
              },
            },
            toolbox: {
              feature: {
                dataZoom: {},
                brush: {
                  type: ["rect", "polygon", "clear"],
                },
              },
            },
            brush: {},
            legend: {
              data: ["肾癌", "肝癌", "肠癌"],
              left: "center",
              bottom: 5,
            },
            xAxis: [
              {
                name: "直径",
                type: "value",
                scale: true,
                axisLabel: {
                  formatter: "{value} mm",
                },
                splitLine: {
                  show: false,
                },
              },
            ],
            yAxis: [
              {
                name: "体积",
                type: "value",
                scale: true,
                axisLabel: {
                  formatter: "{value} cm3",
                },
                splitLine: {
                  show: false,
                },
              },
            ],
            series: [
              {
                name: "肾癌",
                type: "scatter",
                emphasis: {
                  focus: "series",
                },
                data: res.data.kidney.infoList,
                markArea: {
                  silent: true,
                  itemStyle: {
                    color: "transparent",
                    borderWidth: 1,
                    borderType: "dashed",
                  },
                  data: [
                    [
                      {
                        name: "Female Data Range",
                        xAxis: "min",
                        yAxis: "min",
                      },
                      {
                        xAxis: "max",
                        yAxis: "max",
                      },
                    ],
                  ],
                },
              },
              {
                name: "肝癌",
                type: "scatter",
                emphasis: {
                  focus: "series",
                },
                data: res.data.liver.infoList,
                markArea: {
                  silent: true,
                  itemStyle: {
                    color: "transparent",
                    borderWidth: 1,
                    borderType: "dashed",
                  },
                  data: [
                    [
                      {
                        name: "Male Data Range",
                        xAxis: "min",
                        yAxis: "min",
                      },
                      {
                        xAxis: "max",
                        yAxis: "max",
                      },
                    ],
                  ],
                },
              },
              {
                name: "肠癌",
                type: "scatter",
                emphasis: {
                  focus: "series",
                },
                data: res.data.colon.infoList,
                markArea: {
                  silent: true,
                  itemStyle: {
                    color: "transparent",
                    borderWidth: 1,
                    borderType: "dashed",
                  },
                  data: [
                    [
                      {
                        name: "Male Data Range",
                        xAxis: "min",
                        yAxis: "min",
                      },
                      {
                        xAxis: "max",
                        yAxis: "max",
                      },
                    ],
                  ],
                },
              },
            ],
          };
          const chartBox2 = this.$echarts.init(
            document.getElementById("focuspie")
          );
          chartBox2.setOption(option2);
          chartBox2.resize();
          window.addEventListener("resize", function () {
            chartBox2.resize();
          });
        });
      }
    },
    ...mapActions("view", [
      "setShowAnalyze",
      "setShowStatistic",
      "setAnalyzeTargetId",
      "setBarOption",
      "clearAnalyzeData",
      "setIsAnalyzeFocusData",
    ]),
    ...mapActions({
      setAnalyzeData(dispatch, sourceId, value) {
        return dispatch("view/setAnalyzeData", {
          sourceId,
          value,
        });
      },
      setFocusData(dispatch, sourceId, value) {
        return dispatch("view/setFocusData", {
          sourceId,
          value,
        });
      },
      addLabelmapToImage(dispatch, labelmapId, imageId) {
        return dispatch("widgets/addLabelmapToImage", { imageId, labelmapId });
      },
      setLabelmapState(dispatch, labelmapId, labelmapState) {
        return dispatch("widgets/setLabelmapState", {
          labelmapId,
          labelmapState,
        });
      },
    }),
  },
};
</script>

<style lang="scss" scoped>
.labelIdInfo:hover {
  cursor: pointer;
}
</style>