import superWidgetBehavior from '@kitware/vtk.js/Widgets/Widgets3D/DistanceWidget/behavior';

import widgetManipulatorWatcher from '../widgetManipulatorWatcher';

export default function widgetBehavior(publicAPI, model) {
  superWidgetBehavior(publicAPI, model);
  widgetManipulatorWatcher(publicAPI, model);
}
