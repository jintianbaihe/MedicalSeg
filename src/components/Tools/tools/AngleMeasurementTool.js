import create2DTool from './ToolTemplate2D';
import AngleSvg from '../Angle.vue';

// ----------------------------------------------------------------------------

const AngleComponent = create2DTool('Angle', {
  svgComponent: AngleSvg,
  methods: {
    initialMeasurements() {
      return {
        angle: 0.0,
      };
    },
    getMeasurementLabels() {
      return ['Angle'];
    },
    getDisplayedMeasurements() {
      return {
        Angle: `${this.measurements.angle.toFixed(2)}°`,
      };
    },
    updateMeasurements() {
      const widget = this.widgetProxy.getWidget();
      this.measurements.angle = (widget.getAngle() * 180) / Math.PI;
    },
    donePlacing() {
      const state = this.widgetProxy.getWidgetState();
      const numberOfHandles = state.getHandleList().length;
      return numberOfHandles === 3;
    },
    setupViewWidget(viewWidget) {
      viewWidget.setHandleVisibility(false);
    },
  },
});

export default AngleComponent;
