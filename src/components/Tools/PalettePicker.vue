<template>
  <div class="wrapper">
    <div v-for="color in palette" :key="color" class="item">
      <div
        class="blot"
        :style="getStyles(color)"
        v-on:click="$emit('input', color)"
      >
        <v-icon
          v-if="color.toLowerCase() === selectedColor"
          class="check"
          :size="size"
        >
          mdi-check
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PalettePicker",
  props: {
    palette: {
      type: Array,
      default: () => [],
    },
    size: {
      type: Number,
      default: 24,
    },
    value: {
      type: String,
      default: "#999",
    },
  },
  computed: {
    selectedColor() {
      return this.value.toLowerCase();
    },
  },
  methods: {
    getStyles(color) {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        background: color,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
}

.item {
  position: relative;
}

.check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  pointer-events: none;
  color: white !important;
  mix-blend-mode: exclusion;
}

.blot {
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.3);
  border-radius: 25%;
  margin: 4px;
  cursor: pointer;
  transition: border 50ms;
}

.blot:hover {
  border: 1px solid rgba(0, 0, 0, 0.8);
}
</style>