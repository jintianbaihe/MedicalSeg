import macro from "@kitware/vtk.js/macro";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkSliceRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/SliceRepresentationProxy";
import ImagePropertyConstants from "@kitware/vtk.js/Rendering/Core/ImageProperty/Constants";

import { makeSubManager } from "../../../plugins/utils";

const { InterpolationType } = ImagePropertyConstants;

function vtkLabelMapSliceRepProxy(publicAPI, model) {
  model.classHierarchy.push('vtkLabelMapSliceRepProxy');

  const labelMapSub = makeSubManager();
  model.property.setUseLookupTableScalarRange(true);
  model.property.setInterpolationType(InterpolationType.NEAREST);
  model.mapper.setRelativeCoincidentTopologyPolygonOffsetParameters(-2, -2);

  let cachedColorMap = null;

  function updateTransferFunctions(labelmap) {
    const colorMap = labelmap.getColorMap();
    if (colorMap === cachedColorMap) {
      // return;
    }
    cachedColorMap = colorMap;

    const cfun = vtkColorTransferFunction.newInstance();
    const ofun = vtkPiecewiseFunction.newInstance();

    Object.keys(colorMap).forEach((label) => {
      const l = Number(label);
      cfun.addRGBPoint(l, ...colorMap[label].slice(0, 3).map((c) => c / 255));
      ofun.addPoint(l, colorMap[label][3] / 255);
    });

    model.property.setRGBTransferFunction( cfun);
    model.property.setScalarOpacity(ofun);
  }

  function setInputData(labelmap) {
    labelMapSub.sub(
      labelmap.onModified(() => updateTransferFunctions(labelmap))
    );
    updateTransferFunctions(labelmap);
  }

  publicAPI.setColorBy = () => {};

  publicAPI.delete = macro.chain(publicAPI.delete, () => labelMapSub.unsub());
  model.sourceDependencies.push({ setInputData });
}


const DEFAULT_VALUES = {};


export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);
  vtkSliceRepresentationProxy.extend(publicAPI, model);

  vtkLabelMapSliceRepProxy(publicAPI, model);
}


export const newInstance = macro.newInstance(
  extend,
  "vtkLabelMapSliceRepProxy"
);


export default { newInstance, extend };
