import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";
import Presets from "./Presets.json";

const DEFAULT_PRESET = {
  ...vtkColorMaps.getPresetByName("Cool to Warm"),
  Name: "Default (Cool to Warm)",
};

function comparator(a, b) {
  const s1 = a.Name.toLowerCase();
  const s2 = b.Name.toLowerCase();
  return s1 > s2 ? 1 : -(s1 < s2);
}

function registerPresets(presets) {
  presets.forEach((preset) => {
    if (preset.Children) {
      registerPresets(preset.Children);
    } else {
      vtkColorMaps.addPreset(preset);
    }
  });
}

function createGroup(name, childrenNames) {
  const children = childrenNames.map((n) => vtkColorMaps.getPresetByName(n));
  children.sort(comparator);
  return children;
}

registerPresets(Presets.concat(DEFAULT_PRESET));

export default [].concat(
  DEFAULT_PRESET,
  Presets,
  createGroup("ParaView", [
    "2hot",
    "Cool to Warm (Extended)",
    "Linear Blue (8_31f)",
    "Warm to Cool",
  ]),
  createGroup("Others", ["bone_Matlab", "X Ray"])
);
