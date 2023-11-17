<template>
  <v-list>
    <div
      class="flex flex-middle"
      style="width: 100%; padding-top: 10px"
      :style="{ backgroundColor: theme === true ? '#e8eaf6' : '' }"

    >
      <tool-button
        size="43"
        icon="mdi-cursor-default"
        @click="choosePaintTool('default')"
        name="默认交互"
        :buttonClass="
        theme ? 
          useDefaultTool ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
          :useDefaultTool ? [ 'toolBtnSelected'] : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-camera-retake-outline"
        name="重置摄像机"
        @click="resetCamera"
        :disabled="targetImageId === -1"
      />
      <tool-button
        size="43"
        icon="mdi-crop"
        :disabled="targetImageId === -1 || usePaintTool != ''"
        name="裁剪"
        @click="cropOrNot"
        :buttonClass="
        theme ? 
        useCropTool ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
          :useCropTool ? [ 'toolBtnSelected'] : []
        "
      />
      <!-- <tool-button
        size="43"
        icon="mdi-text-recognition"
        name="十字线"
        :disabled="targetImageId === -1"
        @click="resliceCursorOrNot"
        :buttonClass="
          useResliceCursorTool ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
        "
      /> -->
      <tool-button
        size="43"
        icon="mdi-text-recognition"
        name="标注文字"
        :disabled="targetImageId === -1"
        @click="enableMeasureTool(2)"
        :buttonClass="
        theme ? 
          activeToolIndex === 2 ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
          :activeToolIndex === 2 ? ['toolBtnSelected'] : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-angle-acute"
        name="测量角度"
        @click="enableActiveTool(0)"
        :disabled="targetImageId === -1"
        :buttonClass="
          theme ? 
          activeToolIndex === 0 ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
          :activeToolIndex === 0 ? ['toolBtnSelected'] : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-ruler"
        name="测量长度"
        @click="enableActiveTool(1)"
        :disabled="targetImageId === -1"
        :buttonClass="
        theme ? 
          activeToolIndex === 1 ? ['tool-btn', 'toolBtnSelected'] : ['tool-btn']
          :activeToolIndex === 1 ? ['toolBtnSelected'] : []
        "
      />
    </div>
    <div
      class="flex flex-middle"
      id="eleventh-element-introduction"
      style="width: 100%; "
      :style="{ backgroundColor: theme === true ? '#e8eaf6' : '' }"

    >
      <tool-button
        size="43"
        icon="mdi-brush"
        name="画笔"
        :disabled="usePaintTool === ''"
        @click="choosePaintTool('paint')"
        :buttonClass="
          usePaintTool == 'paint' &&
          activeLabelmapState.selectedLabel != 0 &&
          theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-format-paint"
        name="2D笔刷"
        :disabled="usePaintTool === ''"
        @click="choosePaintTool('paint2d')"
        :buttonClass="
          usePaintTool == 'paint2d' &&
          activeLabelmapState.selectedLabel != 0 &&
          theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-vector-circle"
        name="曲线标注"
        :disabled="usePaintTool === ''"
        @click="choosePaintTool('spline')"
        :buttonClass="
          usePaintTool == 'spline' &&
          activeLabelmapState.selectedLabel != 0 &&
          theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-vector-polygon"
        name="多边形标注"
        :disabled="usePaintTool === ''"
        @click="choosePaintTool('polygon')"
        :buttonClass="
          usePaintTool == 'polygon' &&
          activeLabelmapState.selectedLabel != 0 &&
          theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />

      <tool-button
        size="43"
        icon="mdi-eraser"
        name="橡皮擦"
        :disabled="usePaintTool === ''"
        @click="useEraser"
        :disable="usePaintTool === '' || usePaintTool == ''"
        :buttonClass="
          canPaint && activeLabelmapState.selectedLabel === 0 && theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />
      <tool-button
        size="43"
        icon="mdi-eyedropper-variant"
        @click="choosePaintTool('connectivity')"
        name="提取最大连通域"
        :disabled="usePaintTool === ''"
        :buttonClass="
          usePaintTool == 'connectivity' &&
          activeLabelmapState.selectedLabel != 0 &&
          theme ? 
          !useDefaultTool
            ? ['tool-btn', 'toolBtnSelected']
            : ['tool-btn']
          :
          !useDefaultTool
            ? ['toolBtnSelected']
            : []
        "
      />
    </div>
    <v-card
      style="box-shadow: none"
      class="flex flex-middle"
      :color="theme ? 'indigo lighten-5':''"
    >
      <v-card-text class="paintActions flex flex-middle">
        <v-switch
          hide-details
          v-model="changePaintTool"
          color="indigo"
          label="画笔模式"
          prepend-icon="mdi-palette-outline"
          :disabled="!canPaint"
          class="paintSwitch"
        />
        <v-spacer />
        <v-btn icon small class="mr-3" @click="undo" :disabled="!canPaint">
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-btn icon small @click="redo" :disabled="!canPaint">
          <v-icon>mdi-redo</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>

    <div
      class="toolbox"
      id="tenth-element-introduction"
      style="padding: 0 10px"
    >
      <v-flex xs12>
        <v-menu offset-x>
          <template v-slot:activator="{ on }">
            <v-select
              label="选择/新建一个标签集"
              append-outer-icon="mdi-dots-vertical"
              :items="labelmaps"
              item-text="name"
              item-value="sourceId"
              :disabled="targetImageId === -1"
              :value="labelmapSelection"
              style="overflow: hidden; text-overflow: ellipses"
              @input="setLabelMap"
              @click:append-outer="on.click"
            ></v-select>
          </template>
          <v-list>
            <template v-if="labelmapSelection">
              <v-list-item @click="editName">
                <v-list-item-title>编辑标签集名称</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteLabelmap">
                <v-list-item-title>删除标签集</v-list-item-title>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-title>未选择标签集</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-menu>
      </v-flex>
      <template v-if="editingName">
        <v-flex xs10>
          <v-text-field label="重命名" v-model="editableLabelmapName" />
        </v-flex>
        <v-flex xs2 class="text-center">
          <v-btn icon @click="editingName = false">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
        </v-flex>
      </template>
    </div>
    <v-layout v-show="canPaint" wrap>
      <div
        class="toolbox"
        style="padding: 10px; margin-top: -10px; width: 100%"
      >
        <v-slider
          label="画笔/橡皮擦大小"
          min="1"
          :max="brushSizeMax"
          step="1"
          dirty
          hide-details
          :value="radius"
          @input="setRadius"
        >
          <template v-slot:append>
            <v-text-field
              type="number"
              min="1"
              :max="brushSizeMax"
              step="1"
              hide-details
              single-line
              class="mt-n1 pt-0"
              :value="radius"
              @input="setRadius"
            />
          </template>
        </v-slider>
      </div>
    </v-layout>
    <v-list-group style="margin-top: -10px" id="twelveth-element-introduction">
      <template v-slot:activator>
        <v-icon>mdi-label-multiple-outline</v-icon>
        <v-list-item-title style="margin-left: 10px"
          >标签管理</v-list-item-title
        >
      </template>
      <div style="padding: 0">
        <v-btn @click.stop="addLabel"
        :color="theme ? '#e8eaf6':''"
        style="width: 100%"
      :style="{ color: theme === true ? '#e8eaf6' : '' }"
        >
          <v-icon color="#303F9F">mdi-plus-circle</v-icon>
          &nbsp;添加标签 &nbsp;
        </v-btn>
        <template v-if="colormapArray.length > 0">
          <v-radio-group
            class="radioGroup"
            :value="activeLabel"
            @change="setLabel"
          >
            <div v-for="(labelData, i) in colormapArray" :key="labelData.label">
              <v-list-item v-if="labelData.label > 0">
                <v-list-item-action>
                  <v-radio class="activeRadio" :value="labelData.label" />
                </v-list-item-action>
                <v-list-item-content>
                  <div style="display: flex; align-items: center">
                    <el-color-picker
                      v-model="labelData.rgba"
                      show-alpha
                      :predefine="palette"
                      size="small"
                      @change="setLabelRgba(labelData.label, $event)"
                    ></el-color-picker>

                    <span class="pl-1" style="margin-left: 10px"
                      >Label {{ labelData.label }}</span
                    >
                  </div>
                </v-list-item-content>

                <v-list-item-action>
                  <div style="display: flex">
                    <v-btn icon @click="deleteLabel(labelData.label)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-list-item-action>
              </v-list-item>
            </div>
          </v-radio-group>
        </template>
        <template v-else>
          <div
            class="pt-2 body-1 teal--text text-center"
            style="margin: 16px 0"
          >
            还没有任何标签哦
          </div>
        </template>
      </div>
    </v-list-group>
    <v-list-group :value="true" style="margin-top: -10px">
      <template v-slot:activator>
        <v-icon>mdi-pencil-ruler</v-icon>
        <v-list-item-title style="margin-left: 10px"
          >测量管理</v-list-item-title
        >
      </template>
      <div class="fullWidth">
        <template v-if="tools.length > 0">
          <component
            v-for="(tool, idx) in tools"
            :key="idx"
            :is="tool.component"
            :targetPid="targetImageId"
            :tool-data="tool.data"
            @remove="removeTool(idx)"
            @saveData="saveData(idx, $event)"
            v-slot="toolState"
          >
            <div class="rows">
              <v-icon size="20">
                {{ tool.name === "长度" ? 'mdi-ruler': tool.name == "角度" ? "mdi-angle-acute" : "mdi-text-recognition" }}
              </v-icon>

              <div class="rowContent">
                <span v-if="toolState.toolName == '2D Text'" class="rowContentName"  style="color: #757575;"  :title="toolState.toolName">
                  {{ toolState.toolName || tool.name }}
                </span>
                <div
                  v-for="label in toolState.labels"
                  :key="label"
                  class="rowContentDetails"
                >
                <span  style="color: #757575;">
                  {{  tool.name }}
                </span>
                  : {{ toolState.measurements[label] }}
                </div>
              </div>
              <div class="action">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      @click="jumpTo(tool.data.axis, tool.data.lockToSlice)"
                    >
                    <v-icon size="20">mdi-crosshairs-gps</v-icon>

                    </v-btn>
                  </template>
                  跳转相应切片
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      small
                      icon
                      v-on="on"
                      @click="toolState.remove(); close()"
                    >
                    <v-icon size="20">mdi-delete-outline</v-icon>

                    </v-btn>
                  </template>
                  删除
                </v-tooltip>
              </div>
            </div>
          </component>
        </template>
        <template v-else>
          <div
            class="pt-2 body-1 teal--text text-center"
            style="margin-bottom: 16px"
          >
            还没有任何测量哦
          </div>
        </template>
      </div>
    </v-list-group>

    <v-list-group style="margin-top: -10px">
      <template v-slot:activator>
        <v-icon>mdi-cog</v-icon>
        <v-list-item-title style="margin-left: 10px"
          >基本操作</v-list-item-title
        >
      </template>
      <div style="padding: 0 16px">
        <div style="margin: 4px; font-size: 12px; color: gray">背景设置</div>
        <palettePicker
          :palette="paletteBg"
          :size="24"
          v-on:input="changeGlobalBackground"
          :value="backgroundColor"
        />
      </div>
      <div
        style="
          width: 100%;
          margin-top: 10px;
          padding: 10px 0;
        "
      :style="{ backgroundColor: theme === true ? '#e8eaf6' : '' }"

        id="ninth-element-introduction"
      >
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"
          label
          small
          style="width: 100%; padding: 0 20px"
        >
          <v-icon size="12">mdi-mouse</v-icon>右键：缩放
        </v-chip>
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"

          label
          small
          style="width: 100%; padding: 0 20px"
        >
          <v-icon size="12">mdi-mouse</v-icon>滚动：切换切片
        </v-chip>
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"

          label
          small
          style="width: 100%; padding: 0 20px"
        >
          <v-icon size="12">mdi-mouse</v-icon>左键 + shift：拖动
        </v-chip>
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"

          label
          small
          style="width: 100%; padding: 0 20px"
        >
          <v-icon size="12">mdi-mouse</v-icon>左键 + shift + alt：旋转
        </v-chip>
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"

          label
          small
          style="width: 100%; padding: 0 20px"
        >
          长按<v-icon size="12">mdi-mouse</v-icon>左键水平移动：调整窗宽
        </v-chip>
        <v-chip
          variant="text"
          :color="theme ? '#e8eaf6':''"

          label
          small
          style="width: 100%; padding: 0 20px"
        >
          长按<v-icon size="12">mdi-mouse</v-icon>左键垂直移动：调整窗位
        </v-chip>
      </div>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import vtkPaintFilter from "@kitware/vtk.js/Filters/General/PaintFilter";
import { SlicingMode } from "@kitware/vtk.js/Rendering/Core/ImageMapper/Constants";
import palettePicker from "./PalettePicker";
import { BACKGROUND, WIDGETS } from "../VtkView/palette";
import toolButton from "./ToolButton";
import { fromHex, createLabelMapFromImage } from "../../store/fileLoader";
import {
  createRepresentationInAllViews,
  makeSubManager,
  getCropFilter,
} from "../../plugins/utils";
import { connectedArea } from "@/plugins/api";
import AngleMeasurementTool from "./tools/AngleMeasurementTool";
import RulerMeasurementTool from "./tools/RulerMeasurementTool";
import TextAnnotationTool from "./tools/TextAnnotationTool";

const SYNC = "PaintToolSync";
const NEW_LABELMAP = -2;
const ToolList = [
  {
    name: "角度",
    icon: "angle-tool",
    component: AngleMeasurementTool,
  },
  {
    name: "长度",
    icon: "length-tool",
    component: RulerMeasurementTool,
  },
  {
    name: "文字标注",
    icon: "text-tool",
    component: TextAnnotationTool,
  },
];
const ComponentToTool = {};
ToolList.forEach((tool) => {
  ComponentToTool[tool.component.name] = tool;
});

export default {
  name: "Tools",
  data() {
    return {
      finalized: false,
      lockToSlice: null,
      axis: null,
      color: WIDGETS[0],
      textSize: 16,
      paletteBg: BACKGROUND,
      mouseFocusedViewId: -1,
      palette: [
        "#D53E4F",
        "#e6f598",
        "#abdda4",
        "#66c2a5",
        "#3288bd",
        "#5e4fa2",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585",
      ],
      brushSizeMax: 100,
      radius: 16,
      activeToolIndex: undefined,
      connectivityPoint: null,
      mousedViewId: -1,
      widgetPid: -1,
      measureTool: null,
      initialSlicePlacement: null,
      filter: null,
      usePaintTool: "",
      pendingTool: null,
      cropwidgetId: -1,
      resliceCursorwidgetId: -1,
      useCropTool: false,
      useDefaultTool: true,
      uiToolList: ToolList,
      useResliceCursorTool: false,
      activeLabelmapId: -1,
      targetViewId: -1,
      internalLabelmaps: [],
      widgetId: -1,
      editingName: false,
      editableLabelmapName: "",
      brush2D: false,
      colormapArray: [],
      changePaintTool: false,
      activeToolId: -1,
    };
  },
  components: {
    palettePicker,
    toolButton,
  },
  computed: {
    ...mapState("widgets", {
      imageToLabelmaps: (state) => state.imageToLabelmaps,
      labelmapToImage: (state) => state.labelmapToImage,
      labelmapStates: (state) => state.labelmapStates,
      allCropStates: (state) => state.croppingStates,
      measurements: (state) => state.measurements,
      distanceUnitSymbol: (state) => state.distanceUnitSymbol,
      distanceUnitFactor: (state) => state.distanceUnitFactor,
    }),
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    tools() {
      let tools = [];
      if (this.measurements[this.targetImageId]) {
        const measurements = this.measurements[this.targetImageId];
        tools = tools.concat(
          measurements.map((m) => ({
            ...ComponentToTool[m.componentName],
            data: m.data,
          }))
        );
      }

      if (this.pendingTool) {
        tools = tools.concat(this.pendingTool);
      }

      return tools;
    },
    labelmaps() {
      const labelmaps = this.imageToLabelmaps[this.targetImageId] || [];
      return [
        {
          name: "新建一个标签集",
          sourceId: NEW_LABELMAP,
        },
      ].concat(
        this.internalLabelmaps.filter(
          (l) =>
            labelmaps.indexOf(l.sourceId) > -1 &&
            this.$proxyManager.getProxyById(l.sourceId).getKey("inferObj") ==
              this.files[this.targetImageId].inferObj.substring(0, 2)
        )
      );
    },
    activeLabel() {
      if (this.activeLabelmapState) {
        return this.activeLabelmapState.selectedLabel;
      }
      return -1;
    },
    activeLabelmapProxy() {
      return this.$proxyManager.getProxyById(this.activeLabelmapId);
    },
    activeLabelmapParentImageProxy() {
      return this.$proxyManager.getProxyById(
        this.labelmapToImage[this.activeLabelmapId]
      );
    },
    activeLabelmapState() {
      return this.labelmapStates[this.activeLabelmapId];
    },
    targetImageProxy() {
      return this.$proxyManager.getProxyById(this.targetImageId);
    },
    labelmapSelection() {
      if (this.activeLabelmapProxy) {
        return {
          name: this.editableLabelmapName || this.activeLabelmapProxy.getName(),
          sourceId: this.activeLabelmapProxy.getProxyId(),
        };
      }
      return null;
    },
    canPaint() {
      return this.targetImageId > -1 && this.activeLabelmapId > -1;
    },
    ...mapState("files", {
      landState(state) {
        return state.land;
      },
      files(state) {
        return state.files;
      },
      targetImageId(state) {
        return state.activeSourceId;
      },
    }),
    ...mapState("view", {
      backgroundColor(state) {
        return state.globalBackgroundColor;
      },
    }),
    widgetProxy() {
      return this.$proxyManager.getProxyById(this.widgetPid);
    },
    targetView() {
      return this.$proxyManager.getProxyById(this.targetViewId);
    },
    targetRepresentation() {
      return this.$proxyManager.getRepresentation(
        this.targetImageProxy,
        this.targetView
      );
    },
    displayedMeasurements() {
      return this.getDisplayedMeasurements();
    },
    cropProxy() {
      return this.$proxyManager.getProxyById(this.cropwidgetId);
    },
    paintProxy() {
      return this.$proxyManager.getProxyById(this.widgetId);
    },
    splineProxy() {
      return this.$proxyManager.getProxyById(this.widgetId);
    },
    resliceCursorProxy() {
      return this.$proxyManager.getProxyById(this.resliceCursorwidgetId);
    },
  },
  watch: {
    connectivityPoint(val) {
      connectedArea(this.files[this.targetImageId].fileId, val).then((res) => {
        console.log(res);
        var scalarData = this.activeLabelmapProxy
          .getDataset()
          .getPointData()
          .getScalars()
          .getData();
        let resData = eval(res.data.area);
        for (let i = 0; i < resData.length; i++) {
          scalarData.fill(1, eval(resData[i])[0], eval(resData[i])[1] + 1);
        }
        this.activeLabelmapProxy
          .getDataset()
          .getPointData()
          .getScalars()
          .setData(scalarData);
        this.$proxyManager.renderAllViews();
      });
    },
    changePaintTool(val) {
      if (this.usePaintTool != "") {
        this.usePaintTool = "";
        this.useDefaultTool = true;
      } else {
        this.usePaintTool = "paint";
        this.useDefaultTool = false;
      }
    },
    editableLabelmapName(name) {
      if (this.activeLabelmapProxy) {
        this.activeLabelmapProxy.setName(name);
      }
    },
    activeLabel(label) {
      if (this.filter) {
        this.filter.setLabel(label);
      }
    },
    radius(radius) {
      if (this.filter) {
        this.filter.setRadius(radius);
      }
      if (this.paintProxy) {
        this.paintProxy.getWidget().setRadius(radius);
      }
    },
    usePaintTool(usePaintTool) {
      if (usePaintTool == "paint" || usePaintTool == "paint2d") {
        this.enablePainting();
      } else if (usePaintTool == "spline" || usePaintTool == "polygon") {
        this.enableSplineing();
      } else if (usePaintTool == "connectivity") {
        this.enableConnectivity();
      } else {
        this.disablePainting();
      }
    },
    activeLabelmapProxy() {
      if (this.activeLabelmapProxy) {
        this.editableLabelmapName = this.activeLabelmapProxy.getName();

        const dims = this.activeLabelmapProxy.getDataset().getDimensions();
        this.brushSizeMax = 50;
        // this.brushSizeMax = Math.floor(Math.max(...dims) / 2);

        const labelmap = this.activeLabelmapProxy.getDataset();
        this.labelmapSub.sub(labelmap.onModified(this.updateColorMap));
        this.updateColorMap();
      } else {
        this.labelmapSub.unsub();
      }
      this.editingName = false;
    },
  },
  proxyManagerHooks: {
    onProxyModified(proxy) {
      if (
        this.usePaintTool != "" &&
        proxy.getProxyGroup() === "Representations" &&
        proxy.getInput() === this.activeLabelmapProxy &&
        this.mousedViewId > -1
      ) {
        const view = this.$proxyManager.getProxyById(this.mousedViewId);
        this.updateHandleSlice(view);
      }

      if (
        proxy.getProxyGroup() === "Sources" &&
        proxy.getProxyName() === "LabelMap"
      ) {
        const entry = this.internalLabelmaps.find(
          (l) => l.sourceId === proxy.getProxyId()
        );
        if (entry) {
          entry.name = proxy.getName();
        }
      }
    },
    onProxyCreated({ proxy, proxyGroup, proxyName, proxyId }) {
      if (proxyGroup === "Sources" && proxyName === "LabelMap") {
        this.internalLabelmaps.push({
          name: proxy.getName(),
          sourceId: proxyId,
        });
      }
    },
    onProxyDeleted({ proxyGroup, proxyName, proxyId }) {
      if (proxyGroup === "Sources" && proxyName === "LabelMap") {
        const idx = this.internalLabelmaps.findIndex(
          (l) => l.sourceId === proxyId
        );
        if (idx > -1) {
          this.internalLabelmaps.splice(idx, 1);
        }
      }

      if (proxyId === this.activeLabelmapId) {
        this.activeLabelmapId = -1;
        this.usePaintTool = "";
      } else if (proxyId === this.targetImageId) {
        this.targetImageId = -1;
        this.usePaintTool = "";
      }
    },
  },
  created() {
    this.labelmapSub = makeSubManager();
    this.stateSub = makeSubManager();
    this.internalLabelmaps = this.$proxyManager
      .getSources()
      .filter((s) => s.getProxyName() === "LabelMap")
      .map((s) => ({
        name: s.getName(),
        sourceId: s.getProxyId(),
      }));
  },
  beforeDestroy() {
    if (this.usePaintTool != "") {
      this.disablePainting();
    }
    this.labelmapSub.unsub();
    this.stateSub.unsub();
  },
  methods: {
    enableActiveTool(toolIndex) {
      this.activeToolIndex = toolIndex;
      if (this.targetImageId !== -1 && this.activeToolIndex !== undefined) {
        this.pendingTool = ToolList[this.activeToolIndex];
      }
    },
    clearActiveTool() {
      this.pendingTool = null;
      this.activeToolIndex = undefined;
      this.activeToolId = -1;
    },
    removeTool(index) {
      if (this.pendingTool && index === this.tools.length - 1) {
        this.pendingTool = null;
        this.clearActiveTool();
      } else {
        this.removeMeasurementTool({
          datasetId: this.targetImageId,
          index,
        });
      }
    },
    jumpTo(axis, slice) {
      if (slice !== null) {
        const view = this.$proxyManager
          .getViews()
          .find((v) => v.getAxis && v.getAxis() === axis);
        if (view) {
          const rep = view
            .getRepresentations()
            .find(
              (r) =>
                r.getInput() ===
                this.$proxyManager.getProxyById(this.targetImageId)
            );
          if (rep) {
            rep.setSlice(slice);
          }
        }
      }
    },
    saveData(toolIndex, data) {
      if (this.pendingTool && toolIndex === this.tools.length - 1) {
        this.addMeasurementTool({
          datasetId: this.targetImageId,
          componentName: this.pendingTool.component.name,
          data,
        });
        this.pendingTool = null;
      } else {
        this.updateMeasurementTool({
          datasetId: this.targetImageId,
          index: toolIndex,
          data,
        });
      }
    },

    useEraser() {
      this.usePaintTool = "paint2d";
      this.setLabel(0);
    },
    resetCamera() {
      this.$proxyManager.getViews().forEach((i) => {
        i.resetCamera();
      });
    },
    enableMeasureTool(index) {
      this.pendingTool = ToolList[index];
    },
    resliceCursorOrNot() {
      if (this.useResliceCursorTool) {
        this.useResliceCursorTool = false;
        this.resliceCursorwidgetId = -1;
        this.stateSub.unsub();
      } else {
        this.useResliceCursorTool = true;
        this.useCropTool = false;
        if (this.cropProxy) {
          this.cropProxy.removeFromViews();
          this.$proxyManager.deleteProxy(this.cropProxy);
          this.cropwidgetId = -1;
          let resliceCursorProxy = this.resliceCursorProxy;
          if (!resliceCursorProxy) {
            cropProxy = this.$proxyManager
              .getProxyInGroup("Widgets")
              .find((w) => w.getProxyName() === "ResliceCursor");
            if (!resliceCursorProxy) {
              resliceCursorProxy = this.$proxyManager.createProxy(
                "Widgets",
                "ResliceCursor"
              );
            }
            this.resliceCursorwidgetId = resliceCursorProxy.getProxyId();
          }

          const widget = resliceCursorProxy.getWidget();
          widget.setFaceHandlesEnabled(false);
          widget.setEdgeHandlesEnabled(false);
          const imageData = this.$proxyManager
            .getProxyById(this.targetImageId)
            .getDataset();
          widget.copyImageDataDescription(imageData);

          widget.placeWidget(imageData.getBounds());

          resliceCursorProxy.addToViews();
        }
      }
    },
    cropOrNot() {
      if (this.useCropTool) {
        this.useCropTool = false;
        this.cropProxy.removeFromViews();
        this.$proxyManager.deleteProxy(this.cropProxy);
        this.cropwidgetId = -1;
        this.stateSub.unsub();
      } else {
        this.useCropTool = true;
        this.pendingTool = null;
        this.useResliceCursorTool = false;
        const cropFilter = this.getCropFilter(
          this.$proxyManager.getProxyById(this.targetImageId)
        );
        if (this.resliceCursorProxy) {
          this.resliceCursorProxy.removeFromViews();
          this.$proxyManager.deleteProxy(this.resliceCursorProxy);
          this.resliceCursorwidgetId = -1;
        }
        let cropProxy = this.cropProxy;
        if (!cropProxy) {
          cropProxy = this.$proxyManager
            .getProxyInGroup("Widgets")
            .find((w) => w.getProxyName() === "Crop");
          if (!cropProxy) {
            cropProxy = this.$proxyManager.createProxy("Widgets", "Crop");
          }
          this.cropwidgetId = cropProxy.getProxyId();
        }

        const widget = cropProxy.getWidget();
        const widgetState = cropProxy.getWidgetState();

        widget.setFaceHandlesEnabled(false);
        widget.setEdgeHandlesEnabled(false);
        const imageData = this.$proxyManager
          .getProxyById(this.targetImageId)
          .getDataset();
        widget.copyImageDataDescription(imageData);

        widget.placeWidget(imageData.getBounds());

        if (cropFilter.isResetAvailable()) {
          const state = widgetState.getCroppingPlanes();
          state.setPlanes(cropFilter.getCroppingPlanes());
        }

        const planesState = widgetState.getCroppingPlanes();
        this.stateSub.sub(
          planesState.onModified(() => {
            const planes = planesState.getPlanes();
            cropFilter.setCroppingPlanes(planes);
            this.canReset = cropFilter.isResetAvailable();
            this.storeCropState(this.targetImageId, planes);
          })
        );

        cropProxy.addToViews();
      }
    },
    getCropFilter(volProxy) {
      return getCropFilter(this.$proxyManager, volProxy);
    },
    setLabelRgba(label, e) {
      if (e) {
        let colorarr = e.substring(5, e.length - 1).split(",");
        const lb = this.activeLabelmapProxy.getDataset();
        const cm = lb.getColorMap();
        const origColor = cm[label];
        const colorArray = [colorarr[0], colorarr[1], colorarr[2]];
        if (colorArray.length === 3) {
          lb.setLabelColor(label, [...colorArray, origColor[3]]);
        }
        const color = cm[label].slice();
        color[3] = Number(colorarr[3] * 255);
        lb.setLabelColor(label, color);
        this.$proxyManager.renderAllViews();
      }
    },
    choosePaintTool(tool) {
      this.pendingTool = null;
      if (this.usePaintTool != "" && tool != "default") {
        this.usePaintTool = tool;
        this.useDefaultTool = false;

        if (
          this.activeLabelmapState.selectedLabel === 0 &&
          this.colormapArray.length > 1
        )
          this.setLabel(this.colormapArray[1].label);
      }
      if (tool == "default") {
        this.useDefaultTool = true;
        this.changePaintTool = false;
      }
    },
    ...mapActions({
      addLabelmapToImage(dispatch, labelmapId, imageId) {
        return dispatch("widgets/addLabelmapToImage", { imageId, labelmapId });
      },
      setLabelmapState(dispatch, labelmapId, labelmapState) {
        return dispatch("widgets/setLabelmapState", {
          labelmapId,
          labelmapState,
        });
      },
      deleteLabelmapInternal(dispatch, labelmapId) {
        return dispatch("widgets/deleteLabelmap", labelmapId);
      },
    }),
    setRadius(r) {
      this.radius = Math.max(1, Math.round(r));
    },
    setLabel(l) {
      if (this.usePaintTool != "") {
        const lmState = this.activeLabelmapState;
        if (lmState) {
          lmState.selectedLabel = Number(l);
        }
      }
    },
    editName() {
      if (this.labelmapSelection) {
        this.editingName = !this.editingName;
      }
    },
    deleteLabelmap() {
      if (this.activeLabelmapProxy) {
        this.deleteLabelmapInternal(this.activeLabelmapProxy.getProxyId());
        this.$proxyManager.deleteProxy(this.activeLabelmapProxy);
      }
    },
    filterImageData(source) {
      return (
        source.getProxyName() === "TrivialProducer" &&
        source.getType() === "vtkImageData"
      );
    },
    asHex(colorArray) {
      return `#${colorArray
        .map((c) => `00${c.toString(16)}`.slice(-2))
        .join("")}`;
    },
    setLabelMap(selectionId) {
      this.filter = vtkPaintFilter.newInstance();

      if (selectionId === NEW_LABELMAP) {
        const backgroundImage = this.targetImageProxy.getDataset();
        this.filter.setBackgroundImage(backgroundImage);

        const lmProxy = this.$proxyManager.createProxy("Sources", "LabelMap");
        const lmProxyId = lmProxy.getProxyId();
        this.activeLabelmapId = lmProxyId;
        
        this.addLabelmapToImage(lmProxyId, this.targetImageId);
        const labelmapNum = this.imageToLabelmaps[this.targetImageId].length;

        const lmState = {
          selectedLabel: 1,
          lastColorIndex: 0,
        };
        this.setLabelmapState(lmProxyId, lmState);

        lmProxy.setName(`标签集${labelmapNum}`);
        lmProxy.setKey(
          "inferObj",
          this.files[this.targetImageId].inferObj.substring(0, 2)
        );
        console.log(this.files[this.targetImageId].inferObj);
        const labelMap = createLabelMapFromImage(backgroundImage);
        let hexcolor = fromHex(this.palette[0]);
        hexcolor[3] = 255;
        labelMap.setLabelColor(lmState.selectedLabel, hexcolor);

        lmProxy.setInputData(labelMap);
        this.filter.setLabelMap(labelMap);

        createRepresentationInAllViews(this.$proxyManager, lmProxy);
        this.$proxyManager.renderAllViews();
      } else {
        const lmProxy = this.$proxyManager.getProxyById(selectionId);
        if (lmProxy) {
          this.activeLabelmapId = lmProxy.getProxyId();
          this.filter.setLabelMap(lmProxy.getDataset());
        }
      }

      // this.filter.setLabel(this.activeLabelmapState.selectedLabel);
      // this.filter.setRadius(this.radius);

      // this.$proxyManager.getViews().forEach((view) => {
      //   const source = this.targetImageProxy;
      //   const rep = this.$proxyManager.getRepresentation(source, view);
      //   if (view.bindRepresentationToManipulator && rep) {
      //     view.bindRepresentationToManipulator(rep);
      //   }
      // });
    },
    updateColorMap() {
      const proxy = this.activeLabelmapProxy;
      if (proxy) {
        const labelmap = proxy.getDataset();
        const cm = labelmap.getColorMap();
        const numComp = (a, b) => a - b;
        this.colormapArray = Object.keys(cm)
          .sort(numComp)
          .map((label) => ({
            label: Number(label),
            color: cm[label].slice(0, 3),
            opacity: cm[label][3],
            rgba:
              "rgba(" +
              cm[label].slice(0, 3)[0] +
              "," +
              cm[label].slice(0, 3)[1] +
              "," +
              cm[label].slice(0, 3)[2] +
              "," +
              cm[label][3] / 255,
          }));
      }
    },
    setLabelColor(label, colorStr) {
      if (colorStr) {
        const lb = this.activeLabelmapProxy.getDataset();
        const cm = lb.getColorMap();
        const origColor = cm[label];
        const colorArray = fromHex(colorStr);
        if (colorArray.length === 3) {
          lb.setLabelColor(label, [...colorArray, origColor[3]]);
          this.$proxyManager.renderAllViews();
        }
      }
    },
    setLabelOpacity(label, opacityInput) {
      const lb = this.activeLabelmapProxy.getDataset();
      const cm = lb.getColorMap();
      const color = cm[label].slice();
      if (opacityInput) {
        // input is in [0, 255]
        color[3] = Number(opacityInput);
        lb.setLabelColor(label, color);
      }

      this.$proxyManager.renderAllViews();
    },
    addLabel() {
      const labels = this.colormapArray.map((cm) => cm.label);
      let newLabel = 0;
      while (labels.length) {
        const l = labels.shift();
        if (l - newLabel > 1) {
          newLabel++;
          break;
        }
        if (labels.length === 0) {
          newLabel = l + 1;
          break;
        }
        newLabel = l;
      }
      const lmState = this.activeLabelmapState;
      const colorIndex = (lmState.lastColorIndex + 1) % this.palette.length;
      const newColor = fromHex(this.palette[colorIndex]);
      newColor[3] = 255;
      this.activeLabelmapProxy.getDataset().setLabelColor(newLabel, newColor);
      lmState.lastColorIndex = colorIndex;
      this.setLabel(newLabel);
    },
    deleteLabel(label) {
      const labelmap = this.activeLabelmapProxy.getDataset();
      labelmap.removeLabel(label);

      // clear label
      const data = labelmap.getPointData().getScalars().getData();
      for (let i = 0; i < data.length; i++) {
        if (data[i] === label) {
          data[i] = 0;
        }
      }

      // set this.label to a valid label (0 is always valid)
      if (this.colormapArray.length > 1)
        this.setLabel(this.colormapArray[2].label);
      else this.setLabel(0);

      this.$proxyManager.renderAllViews();
    },
    undo() {
      this.filter.undo();
      this.$proxyManager.renderAllViews();
    },
    redo() {
      this.filter.redo();
      this.$proxyManager.renderAllViews();
    },
    colorToBackgroundCSS(cmArray, index) {
      const { color, opacity } = cmArray[index];
      const rgba = [...color, opacity / 255];
      return {
        backgroundColor: `rgba(${rgba.join(",")})`,
      };
    },
    updateHandleSlice(view) {
      const position = [0, 0, 0];
      const manipulator = this.paintProxy.getWidget().getManipulator();
      const representation = this.$proxyManager.getRepresentation(
        this.targetImageProxy,
        view
      );
      // representation is in XYZ, not IJK, so slice is in world space
      position[view.getAxis()] = representation.getSlice();
      manipulator.setHandleOrigin(position);
    },
    enableConnectivity() {
      var that = this;
      const paintProxy = this.$proxyManager.createProxy("Widgets", "Paint");
      paintProxy.getWidget().setRadius(this.radius);
      paintProxy
        .getWidget()
        .placeWidget(this.activeLabelmapProxy.getDataset().getBounds());

      this.widgetId = paintProxy.getProxyId();
      this.mousedViewId = -1;

      const view3DHandler = (view) => {
        view.getInteractor().requestAnimation(SYNC);
        return () => {
          view.getInteractor().cancelAnimation(SYNC);
        };
      };
      const view2DHandler = (view, widgetManager, viewWidget) => {
        view.getInteractor().requestAnimation(SYNC);
        widgetManager.grabFocus(viewWidget);
        const priority = viewWidget.getPriority() + 1;

        const vsub = view.getInteractor().onMouseMove(() => {
          if (this.mousedViewId === view.getProxyId()) {
            return;
          }
          this.mousedViewId = view.getProxyId();

          this.updateHandleSlice(view);
        }, priority);

        const s1 = viewWidget.onStartInteractionEvent(() => {
          this.activeLabelmapProxy.setKey("isChanged", true);
          this.filter.setSlicingMode(SlicingMode["XYZ"[view.getAxis()]]);
          this.filter.startStroke();
          this.filter.addPoint(
            this.paintProxy.getWidgetState().getTrueOrigin()
          );
          this.connectivityPoint = this.paintProxy
            .getWidgetState()
            .getTrueOrigin();
        });

        const s2 = viewWidget.onInteractionEvent(() => {
          if (viewWidget.getPainting()) {
            // this.filter.addPoint(
            //   this.paintProxy.getWidgetState().getTrueOrigin()
            // );
          }
        });

        const s3 = viewWidget.onEndInteractionEvent(() => {
          // this.filter.addPoint(
          //   this.paintProxy.getWidgetState().getTrueOrigin()
          // );
          this.filter.endStroke();
        });

        return [
          () => view.getInteractor().cancelAnimation(SYNC),
          vsub.unsubscribe,
          s1.unsubscribe,
          s2.unsubscribe,
          s3.unsubscribe,
        ];
      };

      paintProxy.addToViews();
      paintProxy.executeViewFuncs({
        View3D: view3DHandler,
        View2D_X: view2DHandler,
        View2D_Y: view2DHandler,
        View2D_Z: view2DHandler,
      });
    },
    enablePainting() {
      const paintProxy = this.$proxyManager.createProxy("Widgets", "Paint");
      paintProxy.getWidget().setRadius(this.radius);
      paintProxy
        .getWidget()
        .placeWidget(this.activeLabelmapProxy.getDataset().getBounds());

      this.widgetId = paintProxy.getProxyId();
      this.mousedViewId = -1;

      const view3DHandler = (view) => {
        view.getInteractor().requestAnimation(SYNC);
        return () => {
          view.getInteractor().cancelAnimation(SYNC);
        };
      };
      const view2DHandler = (view, widgetManager, viewWidget) => {
        view.getInteractor().requestAnimation(SYNC);
        widgetManager.grabFocus(viewWidget);
        const priority = viewWidget.getPriority() + 1;

        const vsub = view.getInteractor().onMouseMove(() => {
          if (this.mousedViewId === view.getProxyId()) {
            return;
          }
          this.mousedViewId = view.getProxyId();

          this.updateHandleSlice(view);
        }, priority);

        const s1 = viewWidget.onStartInteractionEvent(() => {
          this.activeLabelmapProxy.setKey("isChanged", true);
          if (this.usePaintTool == "paint2d") {
            this.filter.setSlicingMode(SlicingMode["XYZ"[view.getAxis()]]);
          } else {
            this.filter.setSlicingMode(SlicingMode.NONE);
          }
          this.filter.startStroke();
          this.filter.addPoint(
            this.paintProxy.getWidgetState().getTrueOrigin()
          );
        });

        const s2 = viewWidget.onInteractionEvent(() => {
          if (viewWidget.getPainting()) {
            this.filter.addPoint(
              this.paintProxy.getWidgetState().getTrueOrigin()
            );
          }
        });

        const s3 = viewWidget.onEndInteractionEvent(() => {
          // this.filter.addPoint(
          //   this.paintProxy.getWidgetState().getTrueOrigin()
          // );
          this.filter.endStroke();
        });

        return [
          () => view.getInteractor().cancelAnimation(SYNC),
          vsub.unsubscribe,
          s1.unsubscribe,
          s2.unsubscribe,
          s3.unsubscribe,
        ];
      };

      paintProxy.addToViews();
      paintProxy.executeViewFuncs({
        View3D: view3DHandler,
        View2D_X: view2DHandler,
        View2D_Y: view2DHandler,
        View2D_Z: view2DHandler,
      });
    },
    enableSplineing() {
      const splineProxy = this.$proxyManager.createProxy("Widgets", "Spline");
      splineProxy
        .getWidget()
        .placeWidget(this.activeLabelmapProxy.getDataset().getBounds());

      this.widgetId = splineProxy.getProxyId();
      this.mousedViewId = -1;

      if (this.usePaintTool == "polygon")
        splineProxy.getWidget().setResolution(1);
      splineProxy.getWidget().setResetAfterPointPlacement(true);
      const view3DHandler = (view) => {
        view.getInteractor().requestAnimation(SYNC);
        return () => {
          view.getInteractor().cancelAnimation(SYNC);
        };
      };
      const view2DHandler = (view, widgetManager, viewWidget) => {
        viewWidget.setOutputBorder(true);
        viewWidget.setHandleSizeInPixels(
          2 * Math.max(...this.activeLabelmapProxy.getDataset().getSpacing())
        );
        viewWidget.setFreehandMinDistance(
          4 * Math.max(...this.activeLabelmapProxy.getDataset().getSpacing())
        );
        widgetManager.grabFocus(viewWidget);
        const priority = viewWidget.getPriority() + 1;

        const vsub = view.getInteractor().onMouseMove(() => {
          if (this.mousedViewId === view.getProxyId()) {
            return;
          }
          this.mousedViewId = view.getProxyId();
          this.updateHandleSlice(view);
        }, priority);

        const s1 = viewWidget.onStartInteractionEvent(() => {
          this.filter.setSlicingMode(SlicingMode["XYZ"[view.getAxis()]]);
          this.filter.startStroke();
        });

        const s3 = viewWidget.onEndInteractionEvent(() => {
          const points = viewWidget.getPoints();
          this.activeLabelmapProxy.setKey("isChanged", true);
          this.filter.paintPolygon(points);
          viewWidget.updateRepresentationForRender();
          this.filter.endStroke();
        });

        return [
          () => view.getInteractor().cancelAnimation(SYNC),
          vsub.unsubscribe,
          s1.unsubscribe,
          s3.unsubscribe,
        ];
      };

      splineProxy.addToViews();
      splineProxy.executeViewFuncs({
        View3D: view3DHandler,
        View2D_X: view2DHandler,
        View2D_Y: view2DHandler,
        View2D_Z: view2DHandler,
      });
    },
    disablePainting() {
      this.paintProxy.removeFromViews();
      this.$proxyManager.deleteProxy(this.paintProxy);
      this.widgetId = -1;
    },
    changeGlobalBackground(color) {
      this.setBackgroundColor(color);
    },
    filterImageData(source) {
      return (
        source.getProxyName() === "TrivialProducer" &&
        source.getType() === "vtkImageData"
      );
    },
    storeCropState(datasetId, planes) {
      this.setCroppingState({ datasetId, planes });
    },
    ...mapActions("widgets", [
      "addMeasurementTool",
      "removeMeasurementTool",
      "updateMeasurementTool",
      "setCroppingState",
    ]),
    ...mapActions("view", {
      setBackgroundColor: (dispatch, bg) => dispatch("setGlobalBackground", bg),
    }),
  },
};
</script>

<style lang="scss" scoped>
.toolbox {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px 0;
  margin: 0 5px;
}
.iconbox {
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  margin: 0 6px;
  justify-content: center;
  align-content: center;
  text-align: center;
  .icon {
  }
  span {
    color: gray;
  }
}

.iconActive {
  border: 1px solid #5c6bc0;
  border-radius: 13px;
  background-color: #5c6bc0;
  .icon {
    color: white;
  }
  span {
    color: white;
  }
}

.iconbox:hover {
  cursor: pointer;
}

.paintSwitch {
  margin-top: 0;
  flex: 2;
}
.paintActions {
  padding: 12px 16px;
}
.radioGroup {
  width: 100%;
  margin-top: 0;
}
.colorBoxBackground {
  cursor: pointer;
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.1);
  margin-right: 4px;
  background-image: linear-gradient(
      -45deg,
      #ccc 25%,
      transparent 25%,
      75%,
      #ccc 75%
    ),
    linear-gradient(-45deg, #ccc 25%, transparent 25%, 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, -5px 5px;
  background-repeat: repeat;
}

.colorBox {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.2);
}

.rows {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  padding: 0 16px;
}

.rowAvatar {
  flex: 0;
  margin: 8px;
}

.rowContent {
  flex: 2;
  display: flex;
  flex-flow: column;
  margin: 8px;
  min-width: 0;
}

.rowContentName {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.rowContentDetails {
  font-style: italic;
  color: #444;
  padding: 0 4px;
}

.action {
  margin: 0 2px;
}

.toolIconOverlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #fff;
  opacity: 0.75;
}
</style>