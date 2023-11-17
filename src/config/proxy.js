import vtk2DView from "@kitware/vtk.js/Proxy/Core/View2DProxy";
import vtkGeometryRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/GeometryRepresentationProxy";
import vtkSkyboxRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/SkyboxRepresentationProxy";
import vtkGlyphRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/GlyphRepresentationProxy";
import vtkLookupTableProxy from "@kitware/vtk.js/Proxy/Core/LookupTableProxy";
import vtkMoleculeRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/MoleculeRepresentationProxy";
import vtkPiecewiseFunctionProxy from "@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy";
import vtkProxySource from "@kitware/vtk.js/Proxy/Core/SourceProxy";
import vtkView from "@kitware/vtk.js/Proxy/Core/ViewProxy";

import vtkCropWidget from "./vtk/CropWidget";
import vtkAngleWidget from "./vtk/AngleWidget";
import vtkDistance2DWidget from "./vtk/Distance2DWidget";
import vtkTextWidget from "./vtk/TextWidget";
import vtkPaintWidget from "@kitware/vtk.js/Widgets/Widgets3D/PaintWidget";
import vtkSplineWidget from "@kitware/vtk.js/Widgets/Widgets3D/SplineWidget";
import vtkCustomSliceRepresentationProxy from "./vtk/CustomSliceRepresentationProxy";
import vtkCustomVolumeRepresentationProxy from "./vtk/CustomVolumeRepresentationProxy";
import vtkLabelMapVolumeRepProxy from "./vtk/LabelMapVolumeRepProxy";
import vtkLabelMapSliceRepProxy from "./vtk/LabelMapSliceRepProxy";
import vtkWidgetProxy from "./vtk/WidgetProxy";

import vtkAnimationProxyManager from "@kitware/vtk.js/Proxy/Animation/AnimationProxyManager";
import vtkTimeStepBasedAnimationProxy from "@kitware/vtk.js/Proxy/Animation/TimeStepBasedAnimationHandlerProxy";

import ConfigUtils from "./configUtils";
import proxyUI from "./proxyUI";
import proxyLinks from "./proxyLinks";

const proxyViewRepresentationMapping = {
  View3D: {
    vtkPolyData: { name: "Geometry" },
    vtkImageData: { name: "Volume" },
    vtkLabelMap: { name: "LabelMapVolume" },
    vtkMolecule: { name: "Molecule" },
    Glyph: { name: "Glyph" },
    Skybox: { name: "Skybox" },
  },
  View2D: {
    vtkPolyData: { name: "Geometry" },
    vtkImageData: { name: "Slice" },
    vtkLabelMap: { name: "LabelMapSlice" },
    vtkMolecule: { name: "Molecule" },
    Glyph: { name: "Glyph" },
    Skybox: { name: "Skybox" },
  },
};

const { createProxyDefinition, activateOnCreate } = ConfigUtils;
const ViewToWidgetTypes = {
  View3D: "VOLUME",
  View2D_X: "SLICE",
  View2D_Y: "SLICE",
  View2D_Z: "SLICE",
};

function createDefaultView(classFactory, ui, options, props) {
  return activateOnCreate(
    createProxyDefinition(
      classFactory,
      ui,
      [
        {
          type: "application",
          link: "AnnotationOpacity",
          property: "annotationOpacity",
          updateOnBind: true,
        },
        {
          type: "application",
          link: "OrientationAxesVisibility",
          property: "orientationAxesVisibility",
          updateOnBind: true,
        },
        {
          type: "application",
          link: "OrientationAxesPreset",
          property: "presetToOrientationAxes",
          updateOnBind: true,
        },
        {
          type: "application",
          link: "OrientationAxesType",
          property: "orientationAxesType",
          updateOnBind: true,
        },
      ],
      options,
      props
    )
  );
}

// ----------------------------------------------------------------------------
export default {
  definitions: {
    Proxy: {
      LookupTable: createProxyDefinition(vtkLookupTableProxy, [], [], {
        presetName: "Default (Cool to Warm)",
      }),
      PiecewiseFunction: createProxyDefinition(vtkPiecewiseFunctionProxy),
    },
    Widgets: {
      Crop: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkCropWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Spline: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkSplineWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Paint: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkPaintWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Angle: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkAngleWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Ruler: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkDistance2DWidget,
        viewTypes: ViewToWidgetTypes,
      }),
      Text: createProxyDefinition(vtkWidgetProxy, [], [], {
        factory: vtkTextWidget,
        viewTypes: ViewToWidgetTypes,
      }),
    },
    Sources: {
      TrivialProducer: activateOnCreate(createProxyDefinition(vtkProxySource)),
      LabelMap: createProxyDefinition(vtkProxySource),
    },
    Representations: {
      Geometry: createProxyDefinition(
        vtkGeometryRepresentationProxy,
        proxyUI.Geometry,
        proxyLinks.Geometry
      ),
      Skybox: createProxyDefinition(
        vtkSkyboxRepresentationProxy,
        proxyUI.Skybox,
        proxyLinks.Skybox
      ),
      Slice: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        proxyLinks.Slice
      ),
      SliceX: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: "SliceX",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ].concat(proxyLinks.Slice)
      ),
      SliceY: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: "SliceY",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ].concat(proxyLinks.Slice)
      ),
      SliceZ: createProxyDefinition(
        vtkCustomSliceRepresentationProxy,
        proxyUI.Slice,
        [
          {
            link: "SliceZ",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ].concat(proxyLinks.Slice)
      ),
      Volume: createProxyDefinition(
        vtkCustomVolumeRepresentationProxy,
        proxyUI.Volume,
        proxyLinks.Volume
      ),
      Molecule: createProxyDefinition(
        vtkMoleculeRepresentationProxy,
        proxyUI.Molecule,
        proxyLinks.Molecule
      ),
      Glyph: createProxyDefinition(
        vtkGlyphRepresentationProxy,
        proxyUI.Glyph,
        proxyLinks.Glyph
      ),
      LabelMapVolume: createProxyDefinition(
        vtkLabelMapVolumeRepProxy,
        [], // ui
        [] // links
      ),
      LabelMapSlice: createProxyDefinition(vtkLabelMapSliceRepProxy),
      LabelMapSliceX: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: "SliceX",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ] // links
      ),
      LabelMapSliceY: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: "SliceY",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ] // links
      ),
      LabelMapSliceZ: createProxyDefinition(
        vtkLabelMapSliceRepProxy,
        [], // ui
        [
          {
            link: "SliceZ",
            property: "slice",
            updateOnBind: true,
            type: "application",
          },
        ] // links
      ),
    },
    Views: {
      View3D: createDefaultView(vtkView, proxyUI.View3D),
      View2D: createDefaultView(vtk2DView, proxyUI.View2D),
      View2D_X: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 0 }),
      View2D_Y: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 1 }),
      View2D_Z: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 2 }),
    },
    AnimationManager: {
      AnimationProxyManager: {
        class: vtkAnimationProxyManager,
      },
    },
    Animations: {
      TimeStepAnimation: {
        class: vtkTimeStepBasedAnimationProxy,
      },
    },
  },
  representations: {
    View3D: proxyViewRepresentationMapping.View3D,
    View2D: proxyViewRepresentationMapping.View2D,
    View2D_X: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: "SliceX" },
      vtkLabelMap: { name: "LabelMapSliceX" },
    },
    View2D_Y: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: "SliceY" },
      vtkLabelMap: { name: "LabelMapSliceY" },
    },
    View2D_Z: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: "SliceZ" },
      vtkLabelMap: { name: "LabelMapSliceZ" },
    },
  },
  filters: {
    vtkPolyData: [],
    vtkImageData: [],
    vtkMolecule: [],
    Glyph: [],
  },
};
