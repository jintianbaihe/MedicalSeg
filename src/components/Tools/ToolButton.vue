<template>
    <v-tooltip bottom transition="slide-y-transition">
      <template v-slot:activator="{ on }">
        <v-btn
          text
          tile
          :height="sizeV"
          :width="sizeV"
          :min-width="sizeV"
          :max-width="sizeV"
          :disabled = "disabled"
          :class="classV"
          v-bind="$attrs"
          v-on="{ ...on, ...$listeners }"
        >
          <v-icon :size="iconSize" style="color: #525251">{{ icon }}</v-icon>
          <slot />
        </v-btn>
      </template>
      <span>{{ name }}</span>
    </v-tooltip>
  </template>
  
  <script>
  export default {
    name: 'ToolButton',
    props: {
      icon: { type: String, required: true },
      name: { type: String, required: true },
      disabled: { type: Boolean,default: false },
      size: { type: [Number, String], default: 40 },
      buttonClass: [String, Array, Object],
    },
  
    computed: {
      sizeV() {
        return Number(this.size);
      },
      iconSize() {
        return Math.floor(0.6 * this.sizeV);
      },
      classV() {
        const classSpec = this.buttonClass;
        if (typeof classSpec === 'string') {
          return classSpec;
        }
        if (Array.isArray(classSpec)) {
          return classSpec.join(' ');
        }
        if (classSpec && Object.keys(classSpec).length) {
          return Object.keys(this.buttonClass)
            .filter((key) => this.buttonClass[key])
            .join(' ');
        }
        return '';
      },
    },
  };
  </script>
  