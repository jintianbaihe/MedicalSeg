import create2DTool from './ToolTemplate2D';
import TextSvg from '../Text';

// ----------------------------------------------------------------------------

const TextComponent = create2DTool('Text', {
  svgComponent: TextSvg,
  watch: {
    name() {
      this.updateMeasurements();
    },
  },
  methods: {
    initialMeasurements() {
      return {};
    },
    getMeasurementLabels() {
      return [];
    },
    getDisplayedMeasurements() {
      return {};
    },
    updateMeasurements() {},
    donePlacing() {
      const state = this.widgetProxy.getWidgetState();
      const numberOfHandles = state.getHandleList().length;
      return numberOfHandles === 1;
    },
    setupViewWidget(viewWidget) {
      viewWidget.setHandleVisibility(false);
    },
  },
});

export default TextComponent;
