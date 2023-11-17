<template>
    <g v-if="visible">
      <svg-circle-handles
        :state-labels="['handles', 'moveHandle']"
        :widget-state="widgetState"
        :view-proxy-id="viewProxyId"
        :stroke="color"
        stroke-width="3"
        fill="transparent"
        r="8"
      />
      <svg-poly-line
        :state-labels="['handles', 'moveHandle']"
        :widget-state="widgetState"
        :view-proxy-id="viewProxyId"
        :stroke="color"
        stroke-width="2"
      />
      <svg-label
        :labels="svgLabels"
        :view-proxy-id="viewProxyId"
        :fill="color"
        dx="12"
        dy="-12"
        :styles="{ fontSize: `${fontSize}px` }"
      />
    </g>
  </template>
  
  <script>
  import SvgCircleHandles from './SvgCircleHandles';
  import SvgPolyLine from './SvgPolyLine';
  import SvgLabel from './SvgLabel';
  import VtkMixin from './mixins/VtkMixin';
  export default {
    name: 'RulerSvg',
    components: {
      SvgCircleHandles,
      SvgPolyLine,
      SvgLabel,
    },
    mixins: [VtkMixin],
    props: {
      finalized: Boolean,
      widgetState: {
        type: Object,
        required: true,
      },
      visible: {
        type: Boolean,
        default: true,
      },
      viewProxyId: {
        type: String,
        required: true,
      },
      toolName: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      textSize: {
        type: Number,
        required: true,
      },
      measurements: {
        type: Object,
        required: true,
      },
      labels: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        svgLabels: [],
      };
    },
    computed: {
      rulerValue() {
        return this.measurements[this.labels[0]];
      },
      fontSize() {
        return this.textSize * (window.devicePixelRatio || 1);
      },
    },
    watch: {
      angleValue() {
        this.updateLabels();
      },
    },
    mounted() {
      this.trackVtkSubscription(this.widgetState.onModified(this.updateLabels));
      this.updateLabels();
    },
    methods: {
      updateLabels() {
        const handles = this.widgetState
          .getHandleList()
          .map((h) => h.getOrigin());
        if (handles.length === 2) {
          this.svgLabels = [
            {
              xyz: handles[0],
              text: this.rulerValue,
            },
          ];
        }
      },
    },
  };
  </script>