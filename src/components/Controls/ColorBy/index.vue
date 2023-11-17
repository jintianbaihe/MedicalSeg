<template>
  <div v-if="available">
    <v-card flat class="block">
      <v-container fluid grid-list-xs class="pa-0">
        <v-layout row wrap align-center 
        >
          <div class="flex xs12" style="padding: 0 !important">
            <item-group
              class="container"
              style="padding: 0 !important"
              :value="selectedPreset"
              @change="onChangePreset"
            >
              <v-row no-gutters justify="center">
                <GroupableItem
                  v-for="(item, index) in presets"
                  :key="item.Name"
                  v-slot="{ active, select }"
                  :value="item"
                >
                  <v-col
                    cols="4"
                    :class="{
                      'thumbnail-container': true,
                      blue: active,
                    }"
                    @click="select"
                  >
                    <v-img
                      :src="thumbnails[item.Name] || ''"
                      contain
                      aspect-ratio="1"
                      @click="select"
                    >
                      <v-overlay
                        absolute
                        :value="true"
                        opacity="0.3"
                        class="thumbnail-overlay"
                      >
                        {{ item.Name.replace(/-/g, " ") }}
                      </v-overlay>
                    </v-img>
                  </v-col>
                </GroupableItem>
              </v-row>
            </item-group>
          </div>

          <template v-if="colorBy !== 'solid'">
            <v-flex xs12 class="pt-2">
              <div>
                <span class="body-2">{{ presetName }}</span>
                <img :src="lutImage" class="lutImage" />
              </div>
            </v-flex>
            <v-flex xs5 class="pb-4 negativeTopSpacing">
              <v-text-field
                @change="$proxyManager.renderAllViews()"
                label="Min"
                step="any"
                :disabled="available !== 'geometry'"
                class="negativeTopSpacing"
                hide-details
                :value="dataRange[0]"
                @input="setDataRangeIndex(0, $event)"
              />
            </v-flex>
            <v-flex xs2 class="text-center pb-4 negativeTopSpacing">
              <v-tooltip v-if="available === 'geometry'" bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    small
                    class="negativeTopSpacing"
                    v-on="on"
                    @click="resetDataRange"
                  >
                    <v-icon>mdi-arrow-expand-horizontal</v-icon>
                  </v-btn>
                </template>
                Reset range
              </v-tooltip>
              <v-spacer v-else />
            </v-flex>
            <v-flex xs5 class="pb-4 negativeTopSpacing">
              <v-text-field
                @change="$proxyManager.renderAllViews()"
                label="Max"
                step="any"
                :disabled="available !== 'geometry'"
                class="negativeTopSpacing"
                reverse
                hide-details
                :value="dataRange[1]"
                @input="setDataRangeIndex(1, $event)"
              />
            </v-flex>
          </template>
          <template v-if="available === 'volume'">
            <v-flex
              xs12
              v-if="piecewiseFunction && !hasPresetOpacity"
              v-on:touchstart.stop
            >
              <piecewise-function-editor
                :piecewiseFunction="piecewiseFunction"
                :source="source"
                :proxyManager="$proxyManager"
              />
            </v-flex>
            <v-flex xs12 v-if="hasPresetOpacity">
              <v-layout row align-center>
                <v-flex xs3>
                  <span class="smallLabel">透明度<br />(0为中心)</span>
                </v-flex>
                <v-flex xs6>
                  <v-slider
                    v-model="shift"
                    :min="shiftRange[0]"
                    :max="shiftRange[1]"
                    step="0"
                    hide-details
                    class="slimInput"
                  />
                </v-flex>
                <v-flex xs3>
                  <v-text-field
                    v-model="shift"
                    type="number"
                    :min="shiftRange[0]"
                    :max="shiftRange[1]"
                    step="1"
                    hide-details
                    class="slimInput"
                  />
                </v-flex>
              </v-layout>
            </v-flex>

            <div style="display: flex; width: 100%; margin-bottom: 20px">
              <v-checkbox
                v-model="colorToSlices"
                hide-details
                style="width: 50%"
                color="indigo"
                label=" 切片同步着色"
                class="slimInput"
                @change="applyColorToSlices"
              />
              <v-checkbox
                style="width: 50%"
                v-model="opacityToSlices"
                hide-details
                label="切片同步透明"
                color="indigo"
                class="slimInput"
                @change="applyOpacityToSlices"
              />
            </div>
          </template>
        </v-layout>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import macro from "@kitware/vtk.js/macro";
import vtkMath from "@kitware/vtk.js/Common/Core/Math";
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";
import PwfProxyConstants from "@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy/Constants";
import PiecewiseFunctionEditor from "./PiecewiseFunctionEditor";
import PalettePicker from "../../Tools/PalettePicker";
import Mode from "@kitware/vtk.js/Proxy/Core/LookupTableProxy";
import { SPECTRAL } from "../../VtkView/palette";
import Presets from "../../../config/ColorMaps";
import GroupableItem from "./GroupableItem";
import Vue from "vue";
import ItemGroup from "./ItemGroup";
import {
  createVolumeThumbnailer,
  useCameraOrientation,
  resetOpacityFunction,
  getOpacityRangeFromPreset,
  getColorFunctionRangeFromPreset,
  getLPSDirections,
} from "../../../plugins/volume-thumbnailer";
import { P } from "@kitware/vtk.js/Common/Core/Math/index";
const { Mode: PwfMode } = PwfProxyConstants;
const SOLID_COLOR = { text: "Solid color", value: "solid" };

const WORKING_CANVAS = document.createElement("canvas");
WORKING_CANVAS.setAttribute("width", 300);
WORKING_CANVAS.setAttribute("height", 1);

function getLookupTableImage(lut, min, max, width) {
  WORKING_CANVAS.setAttribute("width", width);
  const ctx = WORKING_CANVAS.getContext("2d");
  const rawData = lut.getUint8Table(min, max, width, true);
  const pixelsArea = ctx.getImageData(0, 0, width, 1);
  pixelsArea.data.set(rawData);
  ctx.putImageData(pixelsArea, 0, 0);
  return WORKING_CANVAS.toDataURL("image/jpg");
}

function convertArrays(arrays, addSolidColor = false) {
  const options = [];
  if (addSolidColor) {
    options.push(SOLID_COLOR);
  }
  for (let i = 0; i < arrays.length; i++) {
    const item = arrays[i];
    options.push({
      text: item.name,
      value: [item.name, item.location],
    });
  }
  return options;
}

export default {
  name: "ColorBy",
  props: ["sourceId"],
  components: {
    PalettePicker,
    PiecewiseFunctionEditor,
    GroupableItem,
    ItemGroup,
  },
  data() {
    return {
      palette: SPECTRAL.concat("#ffffff", "#000000"),
      available: "",
      imgurl: "",
      presetMenu: false,
      colorBy: "solid", // Either 'solid' or [arrayName, arrayLocation]
      arrays: [SOLID_COLOR],
      piecewiseFunction: null,
      solidColor: "#ffffff",
      lutImage: "",
      presetName: "",
      presets: Presets,
      shift: 0, // simple transfer function shift
      dataRange: [0, 0],
      interpolateScalarsBeforeMapping: true,
      colorToSlices: false,
      opacityToSlices: false,
      originalLUTRanges: {}, // arrayname -> dataRange
      thumbnailer: null,
      imageDataRange: null,
      thumbnails: [],
    };
  },
  computed: {
    source() {
      return this.$proxyManager.getProxyById(this.sourceId);
    },
    colorByName() {
      if (Array.isArray(this.colorBy)) {
        return this.colorBy[0];
      }
      return null;
    },
    colorByLocation() {
      if (Array.isArray(this.colorBy)) {
        return this.colorBy[1];
      }
      return null;
    },
    hasPresetOpacity() {
      const preset = vtkColorMaps.getPresetByName(this.presetName);
      return Boolean(preset && preset.OpacityPoints);
    },
    shiftRange() {
      const preset = vtkColorMaps.getPresetByName(this.presetName);
      if (preset) {
        // shift range is original rgb/opacity range centered around 0
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < preset.RGBPoints.length; i += 4) {
          min = Math.min(min, preset.RGBPoints[i]);
          max = Math.max(max, preset.RGBPoints[i]);
        }

        const center = (max - min) / 2;
        return [-center, center];
      }
      return [0, 0];
    },
    origDataRange() {
      return this.originalLUTRanges[this.colorByName] ?? [];
    },
    selectedPreset() {
      return vtkColorMaps.getPresetByName(this.presetName);
    },
    arraySelectValue() {
      return this.arrays.find((arr) =>
        Array.isArray(arr.value)
          ? arr.value[0] === this.colorByName &&
            arr.value[1] === this.colorByLocation
          : arr.value === this.colorBy
      );
    },
  },
  watch: {
    interpolateScalarsBeforeMapping(value) {
      this.updateRepProperty("interpolateScalarsBeforeMapping", value);
    },
    colorBy() {
      if (this.available === "geometry") {
        const myReps = this.$proxyManager
          .getRepresentations()
          .filter((r) => r.getInput() === this.source);
        myReps.forEach((rep) =>
          rep.setColorBy(this.colorByName, this.colorByLocation)
        );

        if (this.colorByName) {
          const lutProxy = this.$proxyManager.getLookupTable(this.colorByName);
          this.setDataRange(lutProxy.getDataRange());
        }

        this.interpolateScalarsBeforeMapping = myReps.reduce(
          (flag, rep) => flag || rep.getInterpolateScalarsBeforeMapping(),
          false
        );

        this.$proxyManager.renderAllViews();
        this.setPreset();
      }

      if (this.colorByName) {
        this.updateLookupTableImage();
      }
    },
    solidColor(value) {
      const color = vtkMath.hex2float(value);
      this.updateRepProperty("color", ...color);
    },
    presetName() {
      this.renderPreset();
    },
    shift() {
      this.renderPreset();
    },
    hasPresetOpacity(value) {
      const arrayName = this.colorByName;
      const pwfProxy = this.$proxyManager.getPiecewiseFunction(arrayName);
      if (value) {
        pwfProxy.setMode(PwfMode.Points);
      } else {
        pwfProxy.setMode(PwfMode.Gaussians);
      }
    },
    dataRange() {
      this.applyColorMap();
    },
  },
  proxyManagerHooks: {
    onProxyRegistrationChange({ proxyGroup }) {
      if (proxyGroup === "Representations") {
        this.update();
      }
    },
  },
  mounted() {
    this.thumbnailer = createVolumeThumbnailer(84);
    let imageData = this.$proxyManager.getProxyById(this.sourceId).getDataset();
    this.thumbnailer.setInputImage(imageData);
    const { cameraDirVec, cameraUpVec } = useCameraOrientation(
      "Posterior",
      "Superior",
      {
        name: this.$proxyManager.getProxyById(this.sourceId).getName(),
        dimensions: imageData.getDimensions(),
        spacing: imageData.getSpacing(),
        origin: imageData.getOrigin(),
        orientation: imageData.getDirection(),
        lpsOrientation: getLPSDirections(imageData.getDirection()),
        worldBounds: imageData.getBounds(),
        worldToIndex: imageData.getWorldToIndex(),
        indexToWorld: imageData.getIndexToWorld(),
      }
    );
    this.imageDataRange = this.$proxyManager
      .getProxyById(this.sourceId)
      .getDataset()
      .getPointData()
      .getScalars()
      .getRange();
    this.thumbnailer.colorTransferFuncProxy.setMode(Mode.Preset);
    this.thumbnailer.resetCameraWithOrientation(cameraDirVec, cameraUpVec);
    const renWin = this.thumbnailer.scene.getRenderWindow();

    async function getThumbnails(
      thumbnails,
      preset,
      thumbnailer,
      imageDataRange
    ) {
      const opRange = getOpacityRangeFromPreset(preset.Name);
      resetOpacityFunction(
        thumbnailer.opacityFuncProxy,
        opRange || imageDataRange,
        preset.Name
      );
      const presetName = preset.Name;

      thumbnailer.colorTransferFuncProxy.setPresetName(preset.Name);
      const ctRange = getColorFunctionRangeFromPreset(preset.Name);

      thumbnailer.colorTransferFuncProxy.setDataRange(
        ...(ctRange || imageDataRange)
      );
      renWin.render();
      const imgurl = await renWin.captureImages()[0];
      if (imgurl) {
        Vue.set(thumbnails, presetName, imgurl);
      }
    }
    this.presets.reduce(
      (promise, preset) =>
        promise.then(() =>
          getThumbnails(
            this.thumbnails,
            preset,
            this.thumbnailer,
            this.imageDataRange
          )
        ),
      Promise.resolve()
    );
  },
  created() {},
  methods: {
    updateRepProperty(fieldName, ...args) {
      const methodName = `set${macro.capitalize(fieldName)}`;
      const myRepresentations = this.$proxyManager
        .getRepresentations()
        .filter((r) => r.getInput() === this.source);
      for (let i = 0; i < myRepresentations.length; i++) {
        if (myRepresentations[i][methodName]) {
          myRepresentations[i][methodName](...args);
        }
      }
      this.$proxyManager.renderAllViews();
    },
    async onChangePreset(preset) {
      if (preset) {
        this.presetName = preset.Name;
        if (this.hasPresetOpacity) {
          this.shift = 0;
        }
      }
    },
    renderPreset() {
      this.applyColorMap();
      this.applyOpacity();
      this.updateLookupTableImage();
      this.$proxyManager.renderAllViews();
    },
    applyOpacity() {
      const arrayName = this.colorByName;
      const pwfProxy = this.$proxyManager.getPiecewiseFunction(arrayName);
      const preset = vtkColorMaps.getPresetByName(this.presetName);

      if (this.hasPresetOpacity && preset && preset.OpacityPoints) {
        const points = [];
        for (let i = 0; i < preset.OpacityPoints.length; i += 2) {
          points.push([preset.OpacityPoints[i], preset.OpacityPoints[i + 1]]);
        }
        let [min, max] = this.shiftRange;
        const width = max - min;
        const normPoints = points.map(([x, y]) => [(x - min) / width, y]);
        pwfProxy.setPoints(normPoints);

        min += this.shift;
        max += this.shift;
        pwfProxy.setDataRange(min, max);
      } else {
        pwfProxy.setDataRange(...this.dataRange);
      }
    },
    applyColorMap() {
      const arrayName = this.colorByName;
      const lutProxy = this.$proxyManager.getLookupTable(arrayName);
      lutProxy.setPresetName(this.presetName);

      if (this.hasPresetOpacity) {
        let [min, max] = this.shiftRange;
        min += this.shift;
        max += this.shift;
        lutProxy.setDataRange(min, max);
      } else {
        lutProxy.setDataRange(...this.dataRange);
      }
    },
    updateLookupTableImage() {
      const arrayName = this.colorByName;
      const lutProxy = this.$proxyManager.getLookupTable(arrayName);
      this.lutImage = getLookupTableImage(
        lutProxy.getLookupTable(),
        ...lutProxy.getDataRange(),
        256
      );

      this.piecewiseFunction =
        this.$proxyManager.getPiecewiseFunction(arrayName);
    },
    setPreset() {
      if (this.colorByName) {
        const lutProxy = this.$proxyManager.getLookupTable(this.colorByName);
        this.presetName = lutProxy.getPresetName();
        // hasPresetOpacity is derived from presetName
        if (this.hasPresetOpacity) {
          const pwfProxy = this.$proxyManager.getPiecewiseFunction(
            this.colorByName
          );
          // compute shift based on saved pwfProxy data range
          const pwfRange = pwfProxy.getDataRange();
          this.shift = pwfRange[0] - this.shiftRange[0];
        }
      }
    },
    update() {
      const myRepresentations = this.$proxyManager
        .getRepresentations()
        .filter((r) => r.getInput() === this.source);
      if (myRepresentations.length) {
        const repGeometry = myRepresentations.find(
          (r) => r.getProxyName() === "Geometry"
        );
        const repVolume = myRepresentations.find(
          (r) => r.getProxyName() === "Volume"
        );
        const repSliceX = myRepresentations.find(
          (r) => r.getProxyName() === "SliceX"
        );

        if (repGeometry) {
          this.available = "geometry";
        } else if (repVolume) {
          this.available = "volume";
        } else {
          this.available = "";
          return;
        }

        const rep = repGeometry || repVolume;

        const propUI = rep
          .getReferenceByName("ui")
          .find((item) => item.name === "colorBy");
        if (propUI) {
          this.arrays = convertArrays(
            propUI.domain.arrays,
            this.available === "geometry"
          );
        }

        const colorByValue = rep.getColorBy();
        const dataset = rep.getInputDataSet();
        const pointScalars = dataset.getPointData().getScalars();
        const cellScalars = dataset.getCellData().getScalars();

        // only get name and location of colorBy array
        if (colorByValue.length) {
          this.colorBy = colorByValue.slice(0, 2);
        } else if (pointScalars) {
          this.colorBy = [pointScalars.getName(), "pointData"];
        } else if (cellScalars) {
          this.colorBy = [cellScalars.getName(), "cellData"];
        } else {
          // should only happen with geometry
          this.colorBy = "solid";
        }

        if (this.available === "geometry") {
          this.solidColor = vtkMath.floatRGB2HexCode(repGeometry.getColor());
        }

        if (repSliceX) {
          this.colorToSlices = repSliceX.getUseColorByForColor();
          this.opacityToSlices = repSliceX.getUseColorByForOpacity();
          this.applyFuncsToSlices({
            color: this.colorToSlices,
            opacity: this.opacityToSlices,
          });
        }
      }

      this.setPreset();

      // set data range
      if (this.colorByName) {
        const lutProxy = this.$proxyManager.getLookupTable(this.colorByName);
        this.saveOriginalRange({
          arrayName: this.colorByName,
          dataRange: lutProxy.getDataRange(),
        });
        this.setDataRange(lutProxy.getDataRange());
      }
    },
    setDataRangeIndex(index, value) {
      const v = Number.parseFloat(value);
      if (!Number.isNaN(v)) {
        const newRange = [...this.dataRange];
        newRange[index] = value;
        if (newRange[0] < newRange[1]) {
          this.setDataRange(newRange);
        }
      }
    },
    resetDataRange() {
      this.setDataRange(this.origDataRange);
      this.$proxyManager.renderAllViews();
    },
    applyColorToSlices(color) {
      this.applyFuncsToSlices({ color: !!color });
    },
    applyOpacityToSlices(opacity) {
      this.applyFuncsToSlices({ opacity: !!opacity });
    },
    applyFuncsToSlices({ color, opacity }) {
      this.colorToSlices = color ?? this.colorToSlices;
      this.opacityToSlices = opacity ?? this.opacityToSlices;

      const reps = this.$proxyManager
        .getRepresentations()
        .filter((r) => r.getInput() === this.source);

      const sliceRep = reps.find((r) =>
        r.isA("vtkCustomSliceRepresentationProxy")
      );
      if (sliceRep) {
        // proxy links will handle syncing slices
        sliceRep.setUseColorByForColor(this.colorToSlices);
        sliceRep.setUseColorByForOpacity(this.opacityToSlices);
      }

      this.$proxyManager.renderAllViews();
    },
    setDataRange(dataRange) {
      this.dataRange = [Number(dataRange[0]) || 0, Number(dataRange[1]) || 0];
    },
    setColorBy(colorBy) {
      this.colorBy = colorBy;
    },
    saveOriginalRange({ arrayName, dataRange }) {
      this.$set(this.originalLUTRanges, arrayName, dataRange);
    },
  },
};
</script>

<style lang="scss" scoped>
.thumbnail-container {
  cursor: pointer;
  padding: 6px !important;
}

.lutImage {
  width: 100%;
  height: 20px;
  border: solid 1px #eee;
  margin-bottom: -5px;
}
.thumbnail-overlay {
  top: 70%;
  height: 30%;
  font-size: 0.7em;
  text-align: center;
}
.smallLabel {
  font-size: 12px;
}
</style>