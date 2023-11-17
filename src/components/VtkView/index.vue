<template>
  <v-container fluid class="container">
    <v-layout column class="floatToolbar" id="eighth-element-introduction">
      <v-tooltip left>
        <span class="pv-no-select">影像快照</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="screenCapture()">
            <v-icon color="grey-lighten-1"> mdi-camera-plus-outline </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip left>
        <span class="pv-no-select">重置摄像机</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="resetCamera()">
            <v-icon color="grey-lighten-1"> mdi-camera-flip-outline </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip left v-if="viewType != 'View3D:default'">
        <span class="pv-no-select">播放动画</span>
        <template v-slot:activator="{ on }">
          <v-btn
            v-if="!sliceInAnimation"
            icon
            dark
            v-on="on"
            v-on:click="playAnimation()"
          >
            <v-icon color="grey-lighten-1"> mdi-play-outline </v-icon>
          </v-btn>
          <v-btn v-else icon dark v-on="on" v-on:click="pauseAnimation()">
            <v-icon color="grey-lighten-1"> mdi-pause </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip v-if="!showAnalyze && !showStatistic" left>
        <span class="pv-no-select">向左旋转90度</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="rollLeft()">
            <v-icon color="grey-lighten-1"> mdi-rotate-left </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip v-if="!showAnalyze && !showStatistic" left>
        <span class="pv-no-select">向右旋转90度</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="rollRight()">
            <v-icon color="grey-lighten-1"> mdi-rotate-right </v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip left v-if="viewType == 'View3D:default'">
        <span class="pv-no-select">矢状面</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="updateOrientation('x')">
            <div style="font-size: 15px">X</div>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip left v-if="viewType == 'View3D:default'">
        <span class="pv-no-select">冠状面</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="updateOrientation('y')">
            <div style="font-size: 15px">Y</div>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip left v-if="viewType == 'View3D:default'">
        <span class="pv-no-select">横断面</span>
        <template v-slot:activator="{ on }">
          <v-btn icon dark v-on="on" v-on:click="updateOrientation('z')">
            <div style="font-size: 15px">Z</div>
          </v-btn>
        </template>
      </v-tooltip>
    </v-layout>

    <v-layout column fill-height>
      <div style="flex: 1; display: grid">
        <div class="vtk-container">
          <div class="vtk-sub-container">
            <v-flex
              fill-height
              class="js-view vtkView"
              :id="viewType"
              :style="{ background: backgroundColor }"
              v-on:mousedown="view.activate()"
            />
            <div v-if="isActive" class="activeView" />
            <ToolSvgTarget
              :viewProxyId="viewProxyId"
              class="svgLayer"
              :viewBox="svgViewBox"
            />
          </div>
        </div>
      </div>
      <div class="toolbarWrapper">
        <ToolbarSheet v-model="backgroundSheet">
          <v-container grid-list-md class="mr-0" style="padding: 12px">
            <v-layout row>
              <v-spacer />
              <PalettePicker
                :size="24"
                :palette="palette"
                :value="backgroundColor"
                v-on:input="changeBackgroundColor"
              />
            </v-layout>
          </v-container>
        </ToolbarSheet>
        <v-toolbar dark height="45px" class="smallToolbar">
          <v-select
            dense
            flat
            hide-details
            class="viewTypeSelector"
            :items="viewTypeItems"
            :value="viewType"
            @change="changeViewType"
          />
          <v-spacer />
          <v-tooltip
            top
            v-if="viewType === 'View3D:default'"
            :disabled="smallScreen || viewPointMenuVisible"
          >
            <template v-slot:activator="{ on: tooltip }">
              <v-menu offset-y top left v-model="viewPointMenuVisible">
                <template v-slot:activator="{ on: menu }">
                  <v-btn
                    class="button"
                    icon
                    v-on="{ ...tooltip, ...menu }"
                    v-show="cameraViewPoints.length"
                    :disabled="viewPointMenuVisible"
                  >
                    <v-icon>mdi-camera-switch</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(item, index) in cameraViewPoints"
                    :key="index"
                    @click="changeCameraViewPoint(item)"
                  >
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <span class="pv-no-select">Change View Point</span>
          </v-tooltip>
          <v-tooltip top :disabled="smallScreen">
            <span class="pv-no-select">背景颜色</span>
            <template v-slot:activator="{ on }">
              <v-btn
                id="thirteenth-element-introduction"
                class="button"
                icon
                :disabled="backgroundSheet || !view"
                v-on="on"
                v-on:click="backgroundSheet = !backgroundSheet"
              >
                <v-icon>mdi-palette</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip
            top
            v-if="
              !smallScreen && singleViewButton && !showAnalyze && !showStatistic
            "
            key="singleView"
          >
            <span class="pv-no-select">1x1</span>
            <template v-slot:activator="{ on }">
              <v-btn
                class="button"
                icon
                v-on="on"
                v-on:click="singleView(layoutIndex)"
              >
                <v-icon>mdi-fullscreen</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip
            top
            v-if="
              !smallScreen && flipViewButton && !showAnalyze && !showStatistic
            "
            key="flipView"
          >
            <span class="pv-no-select">2x1</span>
            <template v-slot:activator="{ on }">
              <v-btn
                class="button"
                icon
                v-on="on"
                v-on:click="splitView(layoutIndex)"
              >
                <v-icon>mdi-flip-horizontal</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip
            top
            v-if="
              !smallScreen && quadViewButton && !showAnalyze && !showStatistic
            "
            key="quadView"
          >
            <span class="pv-no-select">2x2</span>
            <template v-slot:activator="{ on }">
              <v-btn
                class="button"
                icon
                v-on="on"
                v-on:click="quadView(layoutIndex)"
              >
                <v-icon>mdi-widgets</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-toolbar>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import { Breakpoints } from "./constants";
import { updateViewOrientationFromBasisAndAxis } from "../../plugins/utils";
import PalettePicker from "../Tools/PalettePicker";
import ToolbarSheet from "./ToolbarSheet";
import { BACKGROUND } from "./palette";
import ToolSvgTarget from "../Tools/ToolSvgTarget";

const ROTATION_STEP = 2;
const ANNOTATIONS = {
  nw: "<div style='margin: 3px'>&nbsp;${sliceIndex}&nbsp;of&nbsp;${sliceCount}<br>&nbsp;${sliceWidth}&nbsp;x&nbsp;${sliceHeight}</div>",
  se: "窗位:&nbsp;${windowLevel}&nbsp;/&nbsp;窗宽:&nbsp;${windowWidth}",
};
export default {
  name: "VtkView",
  data() {
    return {
      palette: BACKGROUND,
      internalViewId: -1,
      internalIsActive: false,
      backgroundSheet: false,
      inAnimation: false,
      sliceInAnimation: false,
      viewPointMenuVisible: false,
      svgViewBox: '0 0 10 10',
      slice: 2,
      sliceMin: 0,
      test: 10,
      sliceMax: 512,
      viewTypeItems: [
        {
          text: "3D视图",
          value: "View3D:default",
        },
        {
          text: "矢状面 (X)",
          value: "View2D_X:x",
        },
        {
          text: "冠状面 (Y)",
          value: "View2D_Y:y",
        },
        {
          text: "横断面 (Z)",
          value: "View2D_Z:z",
        },
      ],
    };
  },
  components: {
    PalettePicker,
    ToolbarSheet,
    ToolSvgTarget,
  },
  props: {
    layoutIndex: {
      default: 0,
      type: Number,
    },
    layoutCount: {
      default: 1,
      type: Number,
    },
    viewType: {
      default: "",
      type: String,
    },
    backgroundColor: {
      default: "#000",
      type: String,
    },
  },
  updated() {
    this.$proxyManager.resizeAllViews();
  },
  computed: {
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md;
    },
    singleViewButton() {
      return this.layoutCount > 1;
    },
    flipViewButton() {
      return (
        this.layoutCount === 1 ||
        (this.layoutCount === 4 && this.layoutIndex % 2 === 1)
      );
    },
    quadViewButton() {
      return this.layoutCount === 2 && this.layoutIndex === 1;
    },
    isActive() {
      return (
        this.internalIsActive ||
        this.view === this.$proxyManager.getActiveView()
      );
    },
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    ...mapGetters(["cameraViewPoints"]),
    ...mapState("view", {
      viewProxyId(state) {
        return state.viewTypeToId[this.viewType];
      },
      showStatistic: (state) => state.showStatistic,
      showAnalyze: (state) => state.showAnalyze,
      view(state) {
        return this.$proxyManager.getProxyById(
          state.viewTypeToId[this.viewType]
        );
      },
      axisVisible(state) {
        return state.axisVisible;
      },
      viewOrientation(state) {
        return state.viewOrientation;
      },
      cornerstoneViewList(state) {
        return state.cornerstoneViewList;
      },
    }),
  },
  watch: {
    view(view) {
      this.tryMountView(view);
    },
    theme(val){
      if(this.view){
        if(val){
          if(this.viewType.slice(0,6)=="View3D")
          this.changeBackgroundColor("linear-gradient(#7478BE, #C1C3CA)")
          else
          this.changeBackgroundColor("linear-gradient(#666, #999)")
        }else {
          if(this.viewType.slice(0,6)=="View3D")
          this.changeBackgroundColor("linear-gradient(#00002A, #52576E)")
          else
          this.changeBackgroundColor("linear-gradient(black,black)")
        }
      }
    }
  },
  proxyManagerHooks: {
    onActiveViewChange(view) {
      this.internalIsActive = view === this.view;
    },
    onActiveSourceChange(source) {
      if (
        source &&
        source.getProxyName() === "TrivialProducer" &&
        this.view.bindRepresentationToManipulator
      ) {
        const representation = this.$proxyManager.getRepresentation(
          source,
          this.view
        );
        this.view.bindRepresentationToManipulator(representation);
        this.view.updateWidthHeightAnnotation();
      }
    },
    onProxyRegistrationChange() {
      const hasImageData = this.$proxyManager
        .getSources()
        .find((s) => s.getDataset().isA && s.getDataset().isA("vtkImageData"));
      const views = this.$proxyManager.getViews();
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        view.setCornerAnnotation("se", "");
        if (view.getProxyName().indexOf("2D") !== -1 && hasImageData) {
          view.setCornerAnnotations(ANNOTATIONS, true);
        } else {
          view.setCornerAnnotation("nw", "");
        }
      }
    },
  },
  mounted() {
    console.log(this.viewType);

    if (this.view) this.tryMountView(this.view);
    window.addEventListener("resize", this.resizeCurrentView);
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCurrentView();
    });
    this.resizeObserver.observe(this.$el);
    this.resizeCurrentView();
  },
  beforeDestroy() {
    this.resizeObserver.disconnect();
    window.removeEventListener("resize", this.resizeCurrentView);
    if (this.view) {
      this.unmountView(this.view);
    }
  },
  beforeUpdate() {
    if (!this.view) {
      this.changeViewType("View3D:default");
    }
  },
  methods: {
    playAnimation() {
      if (this.view) {
        this.sliceInAnimation = true;
        this.view.setAnimation(true, this);
        let intervalId = null;
        let bounds = this.view.getRepresentations()[0].getBounds();
        let count = this.view.getRepresentations()[0].getSlice();
        let bound = bounds[1];
        let sliceSpacing = this.view
          .getRepresentations()[0]
          .getAnnotations().sliceSpacing;

        if (this.view.getRepresentations()[0].getSlicingMode() == "Y") {
          bound = bounds[3];
        } else if (this.view.getRepresentations()[0].getSlicingMode() == "Z") {
          bound = bounds[5];
        }
        if (
          this.view.getRepresentations()[0].getSliceIndex() == 0 ||
          count == bound
        ) {
          count = bound[0];
          if (this.view.getRepresentations()[0].getSlicingMode() == "Y") {
            count = bounds[2];
          } else if (
            this.view.getRepresentations()[0].getSlicingMode() == "Z"
          ) {
            count = bounds[4];
          }
        }
        const slice = () => {
          if (count < bound && this.sliceInAnimation) {
            count += sliceSpacing;

            this.view.getRepresentations()[0].setSlice(count);
          } else {
            clearInterval(intervalId);
            this.sliceInAnimation = false;

            this.view.setAnimation(false, this);
          }
        };
        intervalId = setInterval(slice, 100);
      }
    },
    pauseAnimation() {
      this.sliceInAnimation = false;
    },
    screenCapture() {
      this.takeScreenshot(this.view);
    },
    tryMountView(view) {
      if (this.internalViewId > -1) {
        const oldView = this.$proxyManager.getProxyById(this.internalViewId);
        this.unmountView(oldView);
        this.internalViewId = -1;
      }
      if (view.getName() == "default") {
        console.log("view", view);
        console.log("getOpenGLRenderWindow", view.getOpenGLRenderWindow());
        // view.getOpenGLRenderWindow().startXR()
        console.log("getRenderer", view.getRenderer());
      }
      view.getRenderWindow().getInteractor().setDesiredUpdateRate(100)
      console.log(
        "getRenderWindow",
        view.getRenderWindow().getInteractor().getDesiredUpdateRate()
      );
      // if (view) {
      //   this.internalViewId = view.getProxyId();
      //   view.setContainer(this.$el.querySelector(".js-view"));
      //   view.setOrientationAxesVisibility(this.axisVisible);
      //   view.resize();
      //   view.renderLater();
      //   window.addEventListener("resize", this.resizeCurrentView);
      //   this.resizeCurrentView();
      // }

      if (view) {
        this.internalViewId = view.getProxyId();
        view.setContainer(this.$el.querySelector(".js-view"));
        view.setOrientationAxesVisibility(this.axisVisible);
        const widgetManager = view.getReferenceByName("widgetManager");
        if (widgetManager) {
          if (!widgetManager.getPickingEnabled()) {
            widgetManager.disablePicking();
          }
        }
      }
    },

    unmountView(view) {
      view.setContainer(null);
    },
    changeBackgroundColor(color) {
      this.changeBackground({
        viewType: this.viewType,
        color,
      });
    },
    changeViewType(viewType) {
      this.swapViews({
        index: this.layoutIndex,
        viewType,
      });
    },
    resizeCurrentView() {
      if (this.view) {
        this.view.resize();
        const [w, h] = this.view.getOpenGLRenderWindow().getSize();
        this.svgViewBox = `0 0 ${w} ${h}`;
      }
    },
    onResize() {
      if (this.view) {
        this.view.resize();
        this.view.renderLater();
      }
    },
    resetCamera() {
      if (this.view) {
        this.view.resetCamera();
      }
    },
    rollLeft() {
      if (this.view) {
        this.view.setAnimation(true, this);
        let count = 0;
        let intervalId = null;
        const rotate = () => {
          if (count < 90) {
            count += ROTATION_STEP;
            this.view.rotate(+ROTATION_STEP);
          } else {
            clearInterval(intervalId);
            this.view.setAnimation(false, this);
          }
        };
        intervalId = setInterval(rotate, 1);
      }
    },
    rollRight() {
      if (this.view) {
        this.view.setAnimation(true, this);
        let count = 0;
        let intervalId = null;
        const rotate = () => {
          if (count < 90) {
            count += ROTATION_STEP;
            this.view.rotate(-ROTATION_STEP);
          } else {
            clearInterval(intervalId);
            this.view.setAnimation(false, this);
          }
        };
        intervalId = setInterval(rotate, 1);
      }
    },
    updateOrientation(mode) {
      if (this.view && !this.inAnimation) {
        this.inAnimation = true;
        updateViewOrientationFromBasisAndAxis(
          this.view,
          this.viewOrientation,
          mode,
          this.viewType === "View3D:default" ? 100 : 0
        ).then(() => {
          this.inAnimation = false;
        });
      }
    },
    ...mapActions("view", [
      "swapViews",
      "singleView",
      "splitView",
      "quadView",
      "changeBackground",
    ]),
    ...mapActions("view", {
      setBackgroundColor: (dispatch, bg) => dispatch("setGlobalBackground", bg),
    }),
    ...mapActions(["takeScreenshot", "changeCameraViewPoint"]),
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  height: 100%;
  padding: 0;
  margin: 0;
}

.vtkView {
  position: relative;
  z-index: 0;
  overflow: hidden;
}

.viewTypeSelector {
  max-width: 140px;
  min-width: 140px;
  user-select: none;
}

.floatToolbar {
  position: absolute;
  z-index: 1;
  right: 10px;
  top: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
}

.toolbarWrapper {
  position: relative;
}

.button {
  /* override vuetify */
  margin: 2px 4px;
}

.smallToolbar {
  overflow: hidden;
}

.activeView {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 8px;
  height: 8px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0) 51%
  );
}

.vtk-container-wrapper {
  flex: 1;
  display: grid;
  grid-template-columns: 20px auto;
  grid-template-rows: auto;
  z-index: 0; /* avoids partial obscuring of focus outline */
}

.vtk-container {
  padding: 0 !important;
  margin: 0 !important;
  /* prevent view from overflowing our app during resize */

  width: 100%;
  height: 100%;

  position: relative;
  overflow: hidden;
}

.vtk-sub-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.vtk-view {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.vtk-view > canvas {
  height: 100%;
}

.vtk-gutter {
  display: flex;
  flex-flow: column;
  height: 100%;
  z-index: 999;
}

.slice-slider {
  position: relative;
  flex: 1 1;
  width: 100%;
  padding: 0 3px;
}
.svgLayer {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  pointer-events: none;
}
</style>