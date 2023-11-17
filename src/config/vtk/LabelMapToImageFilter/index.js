import macro from '@kitware/vtk.js/macro';

const { vtkErrorMacro } = macro;

function vtkLabelMapToImageFilter(publicAPI, model) {
  model.classHierarchy.push('vtkLabelMapToImageFilter');

  publicAPI.requestData = (inData, outData) => {
    const labelMap = inData[0];

    if (!labelMap || !labelMap.isA || !labelMap.isA('vtkLabelMap')) {
      vtkErrorMacro('No labelmap input');
      return;
    }

    /* eslint-disable-next-line */
    outData[0] = labelMap.getImageRepresentation();
  };
}

const DEFAULT_VALUES = {};


export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  macro.obj(publicAPI, model);

  macro.algo(publicAPI, model, 1, 1);

  vtkLabelMapToImageFilter(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(
  extend,
  'vtkLabelMapToImageFilter'
);

export default { newInstance, extend };
