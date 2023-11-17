<template>
  <v-expansion-panels v-model="panelState" multiple accordion>
    <v-expansion-panel
      v-for="(sourceId, index) in datasets"
      :key="sourceId"
      class="datasetPanel"
    >
      <v-expansion-panel-header
        class="pv-no-select pl-3 pr-3 pt-1 pb-1 panelHeader"
        id="third-element-introduction"
      >
        <v-tooltip bottom>
          <span class="pv-no-select">激活</span>
          <template v-slot:activator="{ on }">
            <v-btn
              class="headerMenuButton"
              icon
              small
              v-on="on"
              v-on:click.stop="activateSource(sourceId)"
            >
              <v-icon>
                {{
                  activeSourceId === sourceId
                    ? "mdi-radiobox-marked"
                    : "mdi-radiobox-blank"
                }}
              </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <div
          class="subtitle-2 text-truncate pl-2 pr-2"
          :title="getSourceName(sourceId)"
        >
          {{ getSourceName(sourceId) }}
        </div>
        <v-spacer />
        <!-- <v-btn
          icon
          class="headerMenuButton"
          style="margin: 0 5px"
          small
          v-on:click.stop="toggleDatasetVisibility(sourceId)"
        >
          <v-icon>
            {{
              getDatasetVisibility(sourceId)
                ? "mdi-eye-outline"
                : "mdi-eye-off-outline"
            }}
          </v-icon>
        </v-btn> -->
      </v-expansion-panel-header>
      <v-expansion-panel-content eager class="panelContent">
        <color-group :index="index" :visible="datasets.length > 0" />
        <v-divider></v-divider>

        <div
          style="
            padding: 0px 20px 0px 10px;
            margin-bottom: -25px;
            flex-direction: row;
          "
          id="forth-element-introduction"
          class="flex flex-middle"
        >
          <v-col class="d-flex" cols="9" sm="9">
            <v-select
              dense
              outlined
              v-model="inferObj[sourceId]"
              :items="inferObjItems"
              @change="handleInferObj(sourceId, $event)"
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="3" sm="3">
            <v-btn
              style="margin-bottom: 25px"
              depressed
              outlined
              color="indigo"
              v-if="getInferObj(sourceId) == '器官'"
              :disabled="
                files[sourceId].fileStatus == 'uploading' ||
                files[sourceId].inferObjStatus.organ == 'infered'
              "
              small
              v-on:click.stop="
                infer(sourceId, inferObj[sourceId].substring(0, 2))
              "
            >
              {{
                files[sourceId].fileStatus == "uploading"
                  ? "上传中"
                  : files[sourceId].inferObjStatus.organ == "toinfer"
                  ? "推  理"
                  : files[sourceId].inferObjStatus.organ == "infered"
                  ? "已推理"
                  : "推理中"
              }}
            </v-btn>
            <v-btn
              style="margin-bottom: 25px"
              depressed
              outlined
              color="indigo"
              v-if="getInferObj(sourceId) == '肾癌'"
              :disabled="
                files[sourceId].fileStatus == 'uploading' ||
                files[sourceId].inferObjStatus.kidney == 'infered'
              "
              small
              v-on:click.stop="
                infer(sourceId, inferObj[sourceId].substring(0, 2))
              "
            >
              {{
                files[sourceId].fileStatus == "uploading"
                  ? "上传中"
                  : files[sourceId].inferObjStatus.kidney == "toinfer"
                  ? "推  理"
                  : files[sourceId].inferObjStatus.kidney == "infered"
                  ? "已推理"
                  : "推理中"
              }}
            </v-btn>
            <v-btn
              style="margin-bottom: 25px"
              depressed
              outlined
              color="indigo"
              v-if="getInferObj(sourceId) == '肠癌'"
              :disabled="
                files[sourceId].fileStatus == 'uploading' ||
                files[sourceId].inferObjStatus.colon == 'infered'
              "
              small
              v-on:click.stop="
                infer(sourceId, inferObj[sourceId].substring(0, 2))
              "
            >
              {{
                files[sourceId].fileStatus == "uploading"
                  ? "上传中"
                  : files[sourceId].inferObjStatus.colon == "toinfer"
                  ? "推  理"
                  : files[sourceId].inferObjStatus.colon == "infered"
                  ? "已推理"
                  : "推理中"
              }}
            </v-btn>
            <v-btn
              style="margin-bottom: 25px"
              depressed
              outlined
              color="indigo"
              v-if="getInferObj(sourceId) == '肝癌'"
              :disabled="
                files[sourceId].fileStatus == 'uploading' ||
                files[sourceId].inferObjStatus.liver == 'infered'
              "
              small
              v-on:click.stop="
                infer(sourceId, inferObj[sourceId].substring(0, 2))
              "
            >
              {{
                files[sourceId].fileStatus == "uploading"
                  ? "上传中"
                  : files[sourceId].inferObjStatus.liver == "toinfer"
                  ? "推  理"
                  : files[sourceId].inferObjStatus.liver == "infered"
                  ? "已推理"
                  : "推理中"
              }}
            </v-btn>
          </v-col>
        </div>
        <v-expansion-panels multiple accordion>
          <v-expansion-panel class="subpanel">
            <v-expansion-panel-header
              id="fifth-element-introduction"
              class="pv-no-select subpanelHeader"
            >
              <v-icon left class="flex-grow-0"
                >mdi-label-multiple-outline</v-icon
              >
              <div class="body-2 font-weight-medium flex-grow-0">
                {{ inferObj[sourceId].substring(0, 2) }}标签
              </div>

              <v-dialog v-model="showLabelUpAndDownDialog" width="52%">
                <v-card>
                  <v-card flat>
                    <v-tabs
                      v-model="tab"
                      background-color="deep-purple accent-4"
                      centered
                      dark
                      icons-and-text
                    >
                      <v-tabs-slider></v-tabs-slider>

                      <v-tab href="#tab1">
                        下载标签
                        <v-icon>mdi-file-download-outline</v-icon>
                      </v-tab>

                      <v-tab href="#tab2">
                        上传标签
                        <v-icon>mdi-file-upload-outline</v-icon>
                      </v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                      <v-tab-item value="tab1">
                        <v-card-text>
                          <v-container>
                            <v-row class="mt-2">
                              <v-select
                                v-model="selectedLabels"
                                :items="getLabelMapIds(sourceId)"
                                item-text="name"
                                item-value="labelmapId"
                                chips
                                label="选择要下载的标签"
                                multiple
                                solo
                              >
                              </v-select>
                            </v-row>
                          </v-container>
                        </v-card-text>
                      </v-tab-item>
                      <v-tab-item value="tab2">
                        <v-card-text>
                          <v-container>
                            <v-row class="mt-2">
                              <v-file-input
                                show-size
                                ref="LabelInput"
                                multiple
                                v-model="labelfiles"
                                color="deep-purple accent-4"
                                counter
                                label="标签文件"
                                placeholder="点击上传标签文件"
                                prepend-icon=""
                                outlined
                              >
                                <template v-slot:selection="{ text, index }">
                                  <v-chip
                                    small
                                    dark
                                    label
                                    v-if="index < 15"
                                    color="indigo accent-3"
                                    close
                                    @click:close="removeFile(index)"
                                  >
                                    {{ text }}
                                  </v-chip>
                                  <span
                                    v-else-if="index === 15"
                                    class="text-overline grey--text text--darken-3 mx-2"
                                  >
                                    +{{ files.length - 15 }} File(s)
                                  </span>
                                </template>
                              </v-file-input>
                            </v-row>
                          </v-container>
                        </v-card-text>
                      </v-tab-item>
                    </v-tabs-items>

                    <v-btn
                      style="width: 50%; border-radius: 0"
                      @click="setLabelUpAndDownDialog(false)"
                      >取消</v-btn
                    >
                    <v-btn
                      color="indigo lighten-1"
                      v-if="tab == 'tab1'"
                      style="width: 50%; border-radius: 0; color: white"
                      @click.native="downloadLabels(sourceId)"
                    >
                      下载标签</v-btn
                    >
                    <v-btn
                      color="indigo lighten-1"
                      v-else
                      style="width: 50%; border-radius: 0; color: white"
                      @click.native="handleLabelFile(sourceId)"
                    >
                      上传标签</v-btn
                    >
                  </v-card>
                </v-card>
              </v-dialog>

              <div style="display: flex; justify-content: flex-end">
                <v-btn
                  id="sixth-element-introduction"
                  icon
                  class="headerMenuButton"
                  style="margin: 0 5px"
                  small
                  v-on:click.stop="openLabelUpAndDownFile(sourceId)"
                >
                <svg-icon type="mdi" :path="path"></svg-icon>
                  <!-- <v-icon> mdi-file-arrow-up-down-outline </v-icon> -->
                </v-btn>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content
              eager
              class="panelContent"
              style="padding: 0"
            >
              <div
                multiple
                accordion
                v-for="(item, index) in getLabelMapIds(sourceId)"
                :key="item.name + sourceId + index"
              >
                <div class="subpanel" v-if="getLabelMap(item, sourceId)">
                  <div
                    class="pv-no-select subpanelHeader flex"
                    style="align-items: center"
                  >
                    <v-icon
                      left
                      class="flex-grow-0"
                      @click.stop="toggleLabelVisibility(item.labelmapId)"
                    >
                      {{
                        getLabelVisibility(item.labelmapId)
                          ? "mdi-eye"
                          : "mdi-eye-off"
                      }}
                    </v-icon>
                    <v-icon left class="flex-grow-0" :color="item.color"
                      >mdi-label</v-icon
                    >
                    <span class="body-2 font-weight-medium flex-grow-0">
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel
            id="seventh-element-introduction"
            v-for="(panel, i) in panels"
            :key="i"
            v-if="panel.visible($proxyManager.getProxyById(sourceId))"
            class="subpanel"
          >
            <v-expansion-panel-header class="pv-no-select subpanelHeader">
              <v-icon left class="flex-grow-0">{{ panel.icon }}</v-icon>
              <span class="body-2 font-weight-medium flex-grow-0">
                {{ panel.name }}
              </span>
            </v-expansion-panel-header>
            <v-expansion-panel-content
              eager
              class="panelContent"
              style="padding: 0"
            >
              <component :is="panel.component" :sourceId="sourceId" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>

import { mapState, mapActions } from "vuex";
import ColorGroup from "./ColorGroup";
import Controls from "../Controls";
import { connectWebsocket } from "../../plugins/websocket";
import vtkLabelMap from "../../config/vtk/LabelMap";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import ITKHelper from "@kitware/vtk.js/Common/DataModel/ITKHelper";
import writeImageArrayBuffer from "itk/writeImageArrayBuffer";
import { getExtension, getSupportedExtensions } from "@/store/fileLoader";
import { createRepresentationInAllViews } from "../../plugins/utils";
import { baseurl } from "../../plugins/axios";
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiFileArrowUpDownOutline } from '@mdi/js';

function fromHex(colorStr) {
  const hex = colorStr.slice(1);
  const colorArray = [];
  for (let i = 0; i < hex.length; i += 2) {
    colorArray.push(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return colorArray;
}

function createLabelMapFromImage(imageData) {
  const labelMap = vtkLabelMap.newInstance(
    imageData.get("spacing", "origin", "direction")
  );
  labelMap.setDimensions(imageData.getDimensions());

  const values = new Uint16Array(imageData.getNumberOfPoints());
  const dataArray = vtkDataArray.newInstance({
    numberOfComponents: 1,
    values,
  });
  labelMap.getPointData().setScalars(dataArray);

  labelMap.computeTransforms();
  return labelMap;
}

export default {
  name: "Datasets",
  components: { ColorGroup ,SvgIcon},
  data() {
    return {
      path: mdiFileArrowUpDownOutline,
      tab: null,
      datasets: [],
      selectedLabels: [],
      internalPanelState: {},
      subpanels: {},
      labelfiles: [],
      inferObj: {},
      activeSourceId: -1,
      internalLabelmaps: [],
      inferObjItems: ["器官分割", "肾癌检测", "肝癌检测", "肠癌检测"],
      palette: [
        "#F44336",
        "#E91E63",
        "#9C27B0",
        "#673AB7",
        "#1A237E",
        "#2962FF",
        "#00BCD4",
        "#00695C",
        "#69F0AE",
        "#64DD17",
        "#CDDC39",
        "#FFEB3B",
        "#FFC107",
        "#FF9800",
        "#FF5722",
      ],
    };
  },
  computed: {
    showLabelUpAndDownDialog: {
      get() {
        return this.$store.state.files.showLabelUpAndDownDialog;
      },
      set(val) {
        this.setLabelUpAndDownDialog(val);
      },
    },
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    ...mapState({
      collapseDatasetPanels: "collapseDatasetPanels",
      panels: (state) => {
        const priorities = Object.keys(state.panels).map((n) => Number(n));
        priorities.sort((a, b) => a - b);
        return [].concat(...priorities.map((prio) => state.panels[prio]));
      },
    }),
    ...mapState("files", ["files"]),
    ...mapState("widgets", ["imageToLabelmaps"]),
    panelState: {
      get() {
        const ret = [];
        for (let i = 0; i < this.datasets.length; i++) {
          const id = this.datasets[i];
          if (this.internalPanelState[id]) {
            ret.push(i);
          }
        }
        return ret;
      },
      set(newPanelState) {
        for (let i = 0; i < this.datasets.length; i++) {
          const id = this.datasets[i];
          this.internalPanelState[id] = newPanelState.indexOf(i) > -1;
        }
      },
    },
    smallScreen() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
  created() {
    Controls.forEach((control, i) => this.addPanel(control, i + 10));
  },
  mounted() {
    this.updateDatasetList();
  },
  destroyed() {},
  proxyManagerHooks: {
    onProxyModified() {
      this.updateDatasetList();
    },
    onProxyCreated({ proxy, proxyId, proxyGroup, proxyName }) {
      if (proxyGroup === "Sources" && proxyName === "TrivialProducer") {
        this.updateDatasetList();
        this.$proxyManager.getProxyById(proxyId).activate();
      }
      if (proxyGroup === "Sources" && proxyName === "LabelMap") {
      }
    },
    onProxyDeleted({ proxyId, proxyGroup, proxyName }) {
      if (proxyGroup === "Sources" && proxyName === "TrivialProducer") {
        const idx = this.datasets.indexOf(proxyId);
        if (idx > -1) {
          this.$delete(this.internalPanelState, proxyId);
          this.$delete(this.subpanels, proxyId);
          this.updateDatasetList();
        }
      }
    },
    onActiveSourceChange(source) {
      if (source) {
        this.activeSourceId = source.getProxyId();
        this.setActiveSourceId(this.activeSourceId);
        const labelmaps = this.imageToLabelmaps[source.getProxyId()] || [];
        this.$proxyManager
          .getRepresentations()
          .filter((r) => {
            const id = r.getInput().getProxyId();
            return id != source.getProxyId() || labelmaps.indexOf(id) === -1;
          })
          .forEach((r) => r.setVisibility(false));
        this.$proxyManager
          .getRepresentations()
          .filter((r) => {
            const id = r.getInput().getProxyId();
            return id == source.getProxyId() || labelmaps.indexOf(id) > -1;
          })
          .forEach((r) => r.setVisibility(true));

        this.$proxyManager.getViews().forEach((i) => {
          i.resetCamera();
        });
        this.$proxyManager.resizeAllViews();
      } else {
        this.activeSourceId = -1;
        this.setActiveSourceId(this.activeSourceId);
      }
    },
  },
  methods: {
    getInferObj(sourceId) {
      return this.inferObj[sourceId].substring(0, 2);
    },
    handleInferObj(sourceId, e) {
      this.inferObj[sourceId] = e;
      this.$set(this.inferObj, sourceId, e);
      this.setFileId(
        sourceId,
        this.files[sourceId].fileId,
        this.files[sourceId].fileStatus,
        e,
        this.files[sourceId].inferObjStatus,
        this.files[sourceId].inferStatus
      );
      this.$forceUpdate();
      if (this.imageToLabelmaps[sourceId]) {
        this.imageToLabelmaps[sourceId].map((id) => {
          if (
            this.$proxyManager.getProxyById(id).getKey("inferObj") !=
            e.substring(0, 2)
          ) {
            if (
              typeof this.$proxyManager.getProxyById(id).getKey("visible") ==
              "undefined"
            )
              this.$proxyManager.getProxyById(id).setKey("visible", true);
            if (this.$proxyManager.getProxyById(id).getKey("visible")) {
              this.$proxyManager
                .getProxyById(id)
                .setKey(
                  "colormap",
                  this.$proxyManager.getProxyById(id).getDataset().getColorMap()
                );
              let colormap = {};
              for (let key in this.$proxyManager
                .getProxyById(id)
                .getDataset()
                .getColorMap()) {
                let color = this.$proxyManager
                  .getProxyById(id)
                  .getDataset()
                  .getColorMap()[key];
                color[3] = 0;
                colormap[key] = color;
              }
              this.$proxyManager
                .getProxyById(id)
                .getDataset()
                .setColorMap(colormap);
              this.$proxyManager.getProxyById(id).setKey("visible", false);
              this.$proxyManager.renderAllViews();
            }
          } else {
            if (
              typeof this.$proxyManager.getProxyById(id).getKey("visible") ==
              "undefined"
            )
              this.$proxyManager.getProxyById(id).setKey("visible", true);
            if (!this.$proxyManager.getProxyById(id).getKey("visible")) {
              let colormap = {};
              for (let key in this.$proxyManager
                .getProxyById(id)
                .getKey("colormap")) {
                let color = this.$proxyManager
                  .getProxyById(id)
                  .getKey("colormap")[key];
                if (key != "0") color[3] = 255;
                colormap[key] = color;
              }
              this.$proxyManager
                .getProxyById(id)
                .getDataset()
                .setColorMap(colormap);
              this.$proxyManager.getProxyById(id).setKey("visible", true);
              this.$proxyManager.renderAllViews();
            }
          }
        });
      }
    },
    handleLabelFile(sourceId) {
      this.openLabelFiles(this.labelfiles, sourceId).finally(() => {
        this.load();
        setTimeout(() => {
          this.resetQueue();
          this.labelfiles = [];
        }, 10);
        setTimeout(() => {
          this.showLabelUpAndDownDialog = false;
        }, 10);
      });
    },
    openLabelUpAndDownFile(sourceId) {
      this.setLabelUpAndDownDialog(true);
    },
    downloadLabels(sourceId) {
      let that = this;
      let filetype = getExtension(
        this.$proxyManager.getProxyById(sourceId).getName()
      );
      const supportedExts = getSupportedExtensions();
      if (
        supportedExts.indexOf(
          getExtension(this.$proxyManager.getProxyById(sourceId).getName())
        ) == -1
      ) {
        filetype = "dcm";
      }
      if (filetype == "gz") filetype = "nii.gz";
      else if (filetype == "raw") filetype = "mha";

      async function downloadLabel(labelmapId, labelName) {
        const labelMap = that.$proxyManager
          .getProxyById(labelmapId)
          .getDataset();
        // const labelMap2 = that.$proxyManager.getProxyById("22").getDataset();
        const itkImage = ITKHelper.convertVtkToItkImage(labelMap, {});
        const { arrayBuffer: buffer } = await writeImageArrayBuffer(
          null,
          itkImage,
          labelName + "." + filetype
        );

        // const itkImage2 = ITKHelper.convertVtkToItkImage(labelMap2, {});
        // const { arrayBuffer: buffer2 } = await writeImageArrayBuffer(
        //   null,
        //   itkImage2,
        //   labelName + ".nii"
        // );

        // var arrBuffer = new Uint8Array(buffer1);
        // var arrBuffer2 = new Uint8Array(buffer2);
        // for (var i = 0; i < arrBuffer.length; i++) {
        //   if (arrBuffer2[i]) arrBuffer[i] = arrBuffer2[i];
        // }
        // const blob = new Blob([arrBuffer.buffer]);
        const blob = new Blob([buffer]);
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = labelName + "." + filetype;
        link.click();
      }
      this.selectedLabels.forEach((item) => {
        downloadLabel(item, this.$proxyManager.getProxyById(item).getName());
      });
    },
    getLabelVisibility(labelmapId) {
      if (
        typeof this.$proxyManager.getProxyById(labelmapId).getKey("visible") ==
        "undefined"
      )
        this.$proxyManager.getProxyById(labelmapId).setKey("visible", true);
      if (this.$proxyManager.getProxyById(labelmapId).getKey("visible"))
        return true;
      else return false;
    },
    toggleLabelVisibility(labelmapId) {
      if (
        typeof this.$proxyManager.getProxyById(labelmapId).getKey("visible") ==
        "undefined"
      )
        this.$proxyManager.getProxyById(labelmapId).setKey("visible", true);
      if (this.$proxyManager.getProxyById(labelmapId).getKey("visible")) {
        this.$proxyManager
          .getProxyById(labelmapId)
          .setKey(
            "colormap",
            this.$proxyManager
              .getProxyById(labelmapId)
              .getDataset()
              .getColorMap()
          );
        let colormap = {};
        for (let key in this.$proxyManager
          .getProxyById(labelmapId)
          .getDataset()
          .getColorMap()) {
          let color = this.$proxyManager
            .getProxyById(labelmapId)
            .getDataset()
            .getColorMap()[key];
          color[3] = 0;
          colormap[key] = color;
        }
        this.$proxyManager
          .getProxyById(labelmapId)
          .getDataset()
          .setColorMap(colormap);
        this.$proxyManager.getProxyById(labelmapId).setKey("visible", false);
        this.$proxyManager.renderAllViews();
      } else {
        let colormap = {};
        for (let key in this.$proxyManager
          .getProxyById(labelmapId)
          .getKey("colormap")) {
          let color = this.$proxyManager
            .getProxyById(labelmapId)
            .getKey("colormap")[key];
          if (key != "0") color[3] = 255;
          colormap[key] = color;
        }
        this.$proxyManager
          .getProxyById(labelmapId)
          .getDataset()
          .setColorMap(colormap);
        this.$proxyManager.getProxyById(labelmapId).setKey("visible", true);
        this.$proxyManager.renderAllViews();
      }
    },
    getFileStatus(sourceId) {
      if (this.$store.state.files.files[sourceId] == "") return true;
      return false;
    },
    infer(sourceId, inferObj) {
      let labelInfo = [];
      let sid = sourceId;
      let inferObjStatus = this.files[sourceId].inferObjStatus;
      if (inferObj == "器官") inferObjStatus.organ = "infering";
      else if (inferObj == "肾癌") inferObjStatus.kidney = "infering";
      else if (inferObj == "肠癌") inferObjStatus.colon = "infering";
      else if (inferObj == "肝癌") inferObjStatus.liver = "infering";
      this.setFileId(
        sourceId,
        this.files[sourceId].fileId,
        "infering",
        inferObj,
        inferObjStatus,
        false
      );

      connectWebsocket(
        "ws://" + baseurl + ":9010/infer",
        JSON.stringify({
          fileId: this.files[sourceId].fileId,
          inferObj: inferObj,
          sourceId: sourceId,
        }),
        (data) => {
          console.log(JSON.parse(data));
          if (JSON.parse(data).sendId == 0) {
            labelInfo = JSON.parse(data).labels;
            sid = JSON.parse(data).sourceId;
          } else if (JSON.parse(data).sendId == 1) {
            const lmProxy = this.$proxyManager.createProxy(
              "Sources",
              "LabelMap"
            );
            let dimensions = this.$proxyManager
              .getProxyById(sid)
              .getDataset()
              .getDimensions();

            var scalarData = new Uint8Array(
              dimensions[0] * dimensions[1] * dimensions[2]
            );
            let resData = eval(JSON.parse(data).data);
            for (let i = 0; i < resData.length; i++) {
              scalarData.fill(1, eval(resData[i])[0], eval(resData[i])[1] + 1);
            }
            const visible = this.getDatasetVisibility(sid);
            const backgroundImage = this.$proxyManager
              .getProxyById(sid)
              .getDataset();
            const lmProxyId = lmProxy.getProxyId();
            this.addLabelmapToImage(lmProxyId, sid);
            const labelMap = createLabelMapFromImage(backgroundImage);
            lmProxy.setInputData(labelMap);
            const lmState = {
              selectedLabel: 1,
              lastColorIndex: 0,
            };
            lmProxy.setKey("isChanged", false);
            lmProxy.setKey("labeldd", JSON.parse(data).labelId);
            this.setLabelmapState(lmProxyId, lmState);
            labelMap.getPointData().getScalars().setData(scalarData);
            const cm = labelMap.getColorMap();
            const origColor = cm[1];
            const colorIndex = Number(JSON.parse(data).labelId) - 1;
            const colorArray = fromHex(this.palette[colorIndex]);
            labelMap.setLabelColor(1, [...colorArray, origColor[3]]);
            const color = cm[1].slice();
            color[3] = Number(255);
            labelMap.setLabelColor(1, color);
            const ImageName = labelInfo.filter(
              (i) => i.labelId == JSON.parse(data).labelId
            )[0].name;
            lmProxy.setName(`${ImageName}`);
            lmProxy.setKey("inferObj", inferObj);
            // console.log(inferObj, ImageName, lmProxy.getKey("inferObj"));
            console.log(labelMap, lmProxy);
            createRepresentationInAllViews(this.$proxyManager, lmProxy);
            const rep = this.$proxyManager.getRepresentations().find((r) => {
              const id = r.getInput().getProxyId();
              return id === lmProxyId;
            });
            rep.setVisibility(visible);
            this.$proxyManager.renderAllViews();
            if (inferObj == "器官") inferObjStatus.organ = "infered";
            else if (inferObj == "肾癌") inferObjStatus.kidney = "infered";
            else if (inferObj == "肠癌") inferObjStatus.colon = "infered";
            else if (inferObj == "肝癌") inferObjStatus.liver = "infered";
            this.setFileId(
              sid,
              this.files[sid].fileId,
              "infered",
              this.inferObj[sid],
              inferObjStatus,
              false
            );
            this.$forceUpdate();
          }
        },
        () => {
          console.log("失败的回调函数");
        }
      );
    },
    getLabelMap(labelmap, sourceId) {
      // console.log(
      //   this.$proxyManager.getProxyById(labelmap.labelmapId).getKey("inferObj"),
      //   this.inferObj[sourceId]
      // );
      return (
        this.$proxyManager
          .getProxyById(labelmap.labelmapId)
          .getKey("inferObj") === this.inferObj[sourceId].substring(0, 2)
      );
    },
    getLabelMapIds(sourceId) {
      let labelMaps = [];
      if (this.imageToLabelmaps[sourceId]) {
        this.imageToLabelmaps[sourceId].map((id) => {
          labelMaps.push({
            name: this.$proxyManager.getProxyById(id).getName(),
            labelmapId: id,
            color: `#${this.$proxyManager
              .getProxyById(id)
              .getDataset()
              .getColorMap()[1]
              .slice(0, 3)
              .map((c) => `00${c.toString(16)}`.slice(-2))
              .join("")}`,
          });
        });
      }
      return labelMaps;
    },
    updateDatasetList() {
      const sources = this.$proxyManager
        .getSources()
        .filter(
          (s) =>
            s.getProxyGroup() === "Sources" &&
            s.getProxyName() === "TrivialProducer"
        )
        .filter((s) => Boolean(s.getDataset()));
      for (let i = 0; i < sources.length; i++) {
        const proxy = sources[i];
        const proxyId = proxy.getProxyId();
        if (!(proxyId in this.internalPanelState)) {
          this.internalPanelState[proxyId] = !this.collapseDatasetPanels;
        }
        if (!(proxyId in this.subpanels)) {
          if (this.collapseDatasetPanels) {
            this.subpanels[proxyId] = [];
          } else {
            this.subpanels[proxyId] = Controls.filter((c) => c.visible(proxy))
              .map((c, j) => (c.defaultExpand ? j : -1))
              .filter((v) => v > -1);
          }
        }
      }
      if (sources.length == 1) {
        this.$proxyManager.getProxyById(sources[0].getProxyId()).activate();
        this.activeSourceId = sources[0].getProxyId();
        this.setActiveSourceId(this.activeSourceId);
      }
      this.datasets = sources.map((s) => s.getProxyId());
      this.datasets.forEach((itm, idx) => {
        if (this.inferObj[itm]) {
        } else this.inferObj[itm] = "器官分割";
      });
      this.$store.dispatch("view/updateMasterSourceId", this.datasets);
    },
    getSourceName(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId);
      if (proxy) {
        return proxy.getName();
      }
      return null;
    },
    activateSource(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId);
      if (proxy) {
        this.$proxyManager.getProxyById(sourceId).activate();
      }
      return null;
    },
    deleteDataset(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId);
      if (proxy) {
        this.$proxyManager.deleteProxy(proxy);
      }
    },
    uploadDataset(sourceId) {
      const proxy = this.$proxyManager.getProxyById(sourceId);
      if (proxy) {
        this.$root.$emit("open_girder_panel");
        setTimeout(() => {
          this.$root.$emit("girder_upload_proxy", sourceId);
        }, 10);
      }
    },
    getDatasetVisibility(sourceId) {
      const rep = this.$proxyManager
        .getRepresentations()
        .find((r) => r.getInput().getProxyId() === sourceId);
      return rep ? rep.isVisible() : false;
    },
    toggleDatasetVisibility(sourceId) {
      const visible = !this.getDatasetVisibility(sourceId);
      const labelmaps = this.imageToLabelmaps[sourceId] || [];
      this.$proxyManager
        .getRepresentations()
        .filter((r) => {
          const id = r.getInput().getProxyId();
          return id === sourceId || labelmaps.indexOf(id) > -1;
        })
        .forEach((r) => r.setVisibility(visible));
      this.$proxyManager.resizeAllViews();
    },
    addPanel(component, priority) {
      this.$store.commit("addPanel", { component, priority });
    },
    ...mapActions("files", [
      "openFiles",
      "load",
      "setLabelUpAndDownDialog",
      "resetQueue",
      "setActiveSourceId",
    ]),
    ...mapActions({
      addLabelmapToImage(dispatch, labelmapId, imageId) {
        return dispatch("widgets/addLabelmapToImage", { imageId, labelmapId });
      },
      openLabelFiles(dispatch, files, sourceId) {
        return dispatch("files/openLabelFiles", { files, sourceId });
      },
      setLabelmapState(dispatch, labelmapId, labelmapState) {
        return dispatch("widgets/setLabelmapState", {
          labelmapId,
          labelmapState,
        });
      },
      setFileId(
        dispatch,
        proxyId,
        id,
        fileStatus,
        inferObj,

        inferObjStatus,
        inferStatus
      ) {
        return dispatch("files/setFileId", {
          proxyId,
          id,
          fileStatus,
          inferObj,

          inferObjStatus,
          inferStatus,
        });
      },
    }),
  },
};
</script>

<style lang="scss" scoped>
.datasetPanel:last-child {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.datasetPanel:before,
.subpanel:before {
  box-shadow: none;
}
.panelContent {
  position: relative;
}
.panelContent > :global(.v-expansion-panel-content__wrap) {
  padding: 0 !important;
}

.subpanel {
  padding-left: 20px;
}
.subpanel .panelContent {
  padding: 4px 0;
}
.panelContent .subpanel:first-child {
  border-top: thin solid rgba(0, 0, 0, 0.1);
}
.panelHeader > :not(:global(.v-expansion-panel-header__icon)) {
  flex: unset;
}
.headerMenuButton {
  /* maintain icon width */
  flex: 0 0 auto !important;
}
.subpanelHeader {
  padding: 2px 12px 2px 4px;
  min-height: 48px !important;
}
.v-expansion-panel-content__wrap {
  padding: 0 10px 0 0 !important;
}
</style>