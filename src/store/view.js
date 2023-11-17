import Vue from "vue";
import { updateViewOrientationFromBasisAndAxis } from "../plugins/utils";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import { wrapMutationAsAction } from "../plugins/utils";
import WidgetManagerConstants from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants";
export const DEFAULT_VIEW_TYPE = "View3D:default";
const { CaptureOn } = WidgetManagerConstants;

export const VIEW_TYPE_VALUES = {
  default: "View3D:default",
  x: "View2D_X:x",
  y: "View2D_Y:y",
  z: "View2D_Z:z",
};

export const DEFAULT_VIEW_TYPES = {
  [VIEW_TYPE_VALUES.default]: "3D",
  [VIEW_TYPE_VALUES.x]: "Orientation X",
  [VIEW_TYPE_VALUES.y]: "Orientation Y",
  [VIEW_TYPE_VALUES.z]: "Orientation Z",
};

export const DEFAULT_LPS_VIEW_TYPES = {
  [VIEW_TYPE_VALUES.default]: "3D",
  [VIEW_TYPE_VALUES.x]: "Sagittal",
  [VIEW_TYPE_VALUES.y]: "Coronal",
  [VIEW_TYPE_VALUES.z]: "Axial",
};

export const DEFAULT_VIEW_ORIENTATION = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export default ({ proxyManager }) => ({
  namespaced: true,
  state: {
    viewProxy: null,
    showAnalyze: false,
    showStatistic: false,
    analyzeData: {},
    focusData: {},
    activeTab: 0,
    codeData: [],
    isAnalyzeFocus: false,
    analyzeTargetId: "",
    barOption: {
      xAxis: {
        name: "标签名称",
        data: [],
      },
      yAxis: {
        name: "器官数量",
      },
      series: [
        {
          type: "bar",
          data: [],
        },
      ],
    },
    viewsInitialized: false,
    backgroundColors: {},
    
    globalBackgroundColor: "linear-gradient(#666, #999)",
    viewOrder: Object.values({
      default: "View3D:default",
      x: "View2D_X:x",
      y: "View2D_Y:y",
      z: "View2D_Z:z",
    }),
    visibleCount: 4,
    axisVisible: true,
    viewOrientation: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    viewTypeToId: {},
    viewTypes: ["View3D", "View2D_X", "View2D_Y", "View2D_Z"],
  },
  getters: {
    VIEW_PROXY(state) {
      return state.viewProxy;
    },
  },
  actions: {
    setActiveTab: wrapMutationAsAction("setActiveTab"),
    updateMasterSourceId({ dispatch, state }, datasets) {
      const hiddenDatasets = proxyManager
        .getRepresentations()
        .filter((r) => !r.isVisible())
        .map((r) => r.getInput().getProxyId());
      const fullyVisibleDatasets = datasets.filter(
        (dataset) => !hiddenDatasets.includes(dataset)
      );

      if (!fullyVisibleDatasets.includes(state.masterSourceId)) {
        if (fullyVisibleDatasets.length === 0) {
          dispatch("setMasterSourceId", null);
        } else {
          dispatch("setMasterSourceId", fullyVisibleDatasets[0]);
        }
      }
    },
    setMasterSourceId({ commit, dispatch, state }, sourceId) {
      const blockAnimation = state.masterSourceId === null && sourceId !== null;
      commit("setMasterSourceId", sourceId);
      if (state.axisPreset === "lps") {
        dispatch("configureViewOrientationAndTypes", blockAnimation);
      }
    },
    setShowAnalyze({ commit, dispatch, state }, value) {
      commit("setShowAnalyze", value);
    },
    setShowStatistic({ commit, dispatch, state }, value) {
      commit("setShowStatistic", value);
    },
    setBarOption({ commit, dispatch, state }, { xData, yData }) {
      commit("setBarOption", { xData, yData });
    },
    setAnalyzeData({ commit, dispatch, state }, { sourceId, value }) {
      commit("setAnalyzeData", {
        sourceId: sourceId,
        value: value,
      });
    },
    setFocusData({ commit, dispatch, state }, { sourceId, value }) {
      commit("setFocusData", {
        sourceId: sourceId,
        value: value,
      });
    },
    setCodeData({ commit, dispatch, state }, value) {
      commit("setCodeData", value);
    },
    setIsAnalyzeFocusData({ commit, dispatch, state }, value) {
      commit("setIsAnalyzeFocusData", value);
    },
    clearAnalyzeData({ commit, dispatch, state }) {
      commit("clearAnalyzeData");
    },
    clearCodeData({ commit, dispatch, state }) {
      commit("clearCodeData");
    },
    setAnalyzeTargetId({ commit, dispatch, state }, value) {
      commit("setAnalyzeTargetId", value);
    },
    configureViewOrientationAndTypes(
      { commit, dispatch, state },
      blockAnimation
    ) {
      if (state.axisPreset === "lps") {
        const masterSource = proxyManager.getProxyById(state.masterSourceId);
        if (masterSource?.getDataset().isA("vtkImageData")) {
          const directionMatrix = masterSource.getDataset().getDirection();
          const lpsDirections = getLPSDirections(directionMatrix);
          const axisToXYZ = ["x", "y", "z"];
          const viewTypes = {
            [VIEW_TYPE_VALUES.default]: "3D",
            [VIEW_TYPE_VALUES[axisToXYZ[lpsDirections.l.axis]]]: "Sagittal",
            [VIEW_TYPE_VALUES[axisToXYZ[lpsDirections.p.axis]]]: "Coronal",
            [VIEW_TYPE_VALUES[axisToXYZ[lpsDirections.s.axis]]]: "Axial",
          };
          const viewOrientation = [
            lpsDirections.l.vector,
            lpsDirections.p.vector,
            lpsDirections.s.vector,
          ];
          dispatch("setViewTypes", viewTypes);
          dispatch("setViewOrientation", {
            orientation: viewOrientation,
            blockAnimation,
          });
        } else if (state.previousConfigurationPreset !== "lps") {
          dispatch("setViewTypes", DEFAULT_LPS_VIEW_TYPES);
          dispatch("setViewOrientation", {
            orientation: DEFAULT_VIEW_ORIENTATION,
            blockAnimation,
          });
        }
      } else {
        dispatch("setViewTypes", DEFAULT_VIEW_TYPES);
        dispatch("setViewOrientation", {
          orientation: DEFAULT_VIEW_ORIENTATION,
          blockAnimation,
        });
      }
      commit("setPreviousConfigurationPreset", state.axisPreset);
    },
    setViewOrientation({ commit, state }, { orientation, blockAnimation }) {
      commit("setViewOrientation", orientation);
      Object.entries(state.viewTypeToId).forEach(([viewType, viewId]) => {
        const view = proxyManager.getProxyById(viewId);
        const [type, name] = viewType.split(":");
        updateViewOrientationFromBasisAndAxis(
          view,
          orientation,
          name,
          !blockAnimation && type === "View3D" ? 100 : 0
        );
      });
    },
    setViewTypes({ commit }, viewTypes) {
      commit("setViewTypes", viewTypes);
    },
    setGlobalBackground({ commit }, background) {
      commit("setGlobalBackground", background);
    },
    changeBackground({ commit }, { viewType, color }) {
      commit("changeBackground", { viewType, color });
    },
    setAxisVisible({ commit }, visible) {
      proxyManager.getViews().forEach((view) => {
        view.setOrientationAxesVisibility(visible);
      });
      commit("setAxisVisible", visible);
    },
    swapViews({ commit }, { index, viewType }) {
      commit("swapViews", { index, viewType });
    },
    singleView({ rootState, state, commit }, index) {
      commit("swapViews", {
        index: 0,
        viewType: state.viewOrder[index],
      });
      commit("visibleCount", 1);
    },
    splitView({ rootState, state, commit }, index) {
      commit("swapViews", {
        index,
        viewType: state.viewOrder[1],
      });
      commit("visibleCount", 2);
    },
    quadView({ rootState, state, commit }, index) {
      commit("visibleCount", 4);
    },
    initViews({ commit, state }) {
      if (!state.viewsInitialized) {
        state.viewsInitialized = true;
        let defaultView = null;
        state.viewOrder.forEach((viewType) => {
          const [type, name] = viewType.split(":");
          const view = proxyManager.createProxy("Views", type, { name });

          updateViewOrientationFromBasisAndAxis(
            view,
            state.viewOrientation,
            name
          );
          view.setBackground(0, 0, 0, 0);
          if (viewType == "View3D:default")
            Vue.set(
              state.backgroundColors,
              viewType,
              "linear-gradient(#7478BE, #C1C3CA)"
            );
          else
            Vue.set(
              state.backgroundColors,
              viewType,
              state.globalBackgroundColor
            );

          view.setPresetToOrientationAxes("default");
          if (!view.getReferenceByName("widgetManager")) {
            const widgetManager = vtkWidgetManager.newInstance();
            widgetManager.setRenderer(view.getRenderer());
            widgetManager.setCaptureOn(CaptureOn.MOUSE_MOVE);
            view.set({ widgetManager }, true);
          }
          if (viewType === DEFAULT_VIEW_TYPE) {
            defaultView = view;
          }

          commit("mapViewTypeToId", {
            viewType,
            viewId: view.getProxyId(),
          });
        });

        if (defaultView) {
          defaultView.activate();
        }
      }
    },
    setInteractionStyle3D({ commit }, style) {
      proxyManager
        .getViews()
        .filter((v) => v.getName() === "default")
        .forEach((view) => {
          view.setPresetToInteractor3D(style);
        });
      commit("setInteractionStyle3D", style);
    },
  },
  mutations: {
    setActiveTab(state, value) {
      state.activeTab = value;
    },
    setIsAnalyzeFocusData(state, value) {
      state.isAnalyzeFocus = value;
    },
    setAnalyzeData(state, { sourceId, value }) {
      let index = 0;
      if (state.analyzeData[sourceId]) {
        index = state.analyzeData[sourceId].length;
      } else {
        state.analyzeData[sourceId] = [];
      }
      Vue.set(state.analyzeData[sourceId], index, value);
    },
    setFocusData(state, { sourceId, value }) {
      let index = 0;
      if (state.focusData[sourceId]) {
        index = state.focusData[sourceId].length;
      } else {
        state.focusData[sourceId] = [];
      }
      Vue.set(state.focusData[sourceId], index, value);
    },
    setCodeData(state, value) {
      let index = state.codeData.length;
      Vue.set(state.codeData, index, value);
    },
    clearCodeData(state) {
      state.codeData = [];
    },
    clearAnalyzeData(state) {
      state.analyzeData = {};
    },
    setGlobalBackground(state, background) {
      state.globalBackgroundColor = background;
      const keys = Object.keys(state.backgroundColors);
      for (let i = 0; i < keys.length; i++) {
        state.backgroundColors[keys[i]] = background;
      }
    },
    setBarOption(state, { xData, yData }) {
      let x = {
        name: "标签名称",
        data: xData,
      };
      let y = [
        {
          type: "bar",
          data: yData,
        },
      ];
      Vue.set(state.barOption, "xAxis", x);
      Vue.set(state.barOption, "series", y);
    },
    setInteractionStyle3D(state, style) {
      state.interactionStyle3D = style;
    },
    setViewTypes(state, types) {
      state.viewTypes = types;
    },
    setShowAnalyze(state, value) {
      if (state.showStatistic && value) state.showStatistic = false;
      state.showAnalyze = value;
    },
    setShowStatistic(state, value) {
      if (state.showAnalyze && value) state.showAnalyze = false;
      state.showStatistic = value;
    },
    setAnalyzeTargetId(state, value) {
      state.analyzeTargetId = value;
    },
    setViewOrientation(state, orientation) {
      state.viewOrientation = orientation;
    },
    setMasterSourceId(state, sourceId) {
      state.masterSourceId = sourceId;
    },
    setPreviousConfigurationPreset(state, preset) {
      state.previousConfigurationPreset = preset;
    },
    changeBackground(state, { viewType, color }) {
      state.backgroundColors[viewType] = color;
    },
    setAxisVisible(state, visible) {
      state.axisVisible = visible;
    },
    swapViews(state, { index, viewType }) {
      const dstIndex = state.viewOrder.indexOf(viewType);
      const srcViewType = state.viewOrder[index];
      var temp = state.viewTypes[index];
      state.viewTypes[index] = state.viewTypes[dstIndex];
      state.viewTypes[dstIndex] = temp;
      Vue.set(state.viewOrder, index, viewType);
      Vue.set(state.viewOrder, dstIndex, srcViewType);
    },
    visibleCount(state, count) {
      state.visibleCount = count;
    },
    viewsInitialized(state) {
      state.viewsInitialized = true;
    },
    mapViewTypeToId(state, { viewType, viewId }) {
      Vue.set(state.viewTypeToId, viewType, viewId);
    },
    VIEW_PROXY_SET(state, viewProxy) {
      if (state.viewProxy !== viewProxy) {
        state.viewProxy = viewProxy;
      }
    },
  },
});
