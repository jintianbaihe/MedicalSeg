<template>
  <div
    class="sheet"
    :class="value ? 'visible' : ''"
    :style="{ top: `${sheetTop}px` }"
  >
    <div
      ref="slotWrapper"
      class="grey darken-3 white--text slotWrapper"
      :style="{ transform: `translateY(${visible ? 0 : '100%'})` }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
function onMouseDown(ev) {
  if (!this.$el.contains(ev.target)) {
    this.$emit("input", false);
  }
}

function updateHeight() {
  this.sheetTop = -this.$refs.slotWrapper.offsetHeight;
}
function updateVisibility(newVal, oldVal) {
  if (newVal && !oldVal) {
    document.addEventListener("mousedown", this.onMouseDown, true);
    this.$nextTick(() => {
      this.updateHeight();
      this.visible = true;
    });
  } else {
    document.removeEventListener("mousedown", this.onMouseDown, true);
    this.visible = false;
  }
}

export default {
  props: {
    value: { type: Boolean, default: false },
  },
  data: () => ({
    sheetTop: 0,
    visible: false,
  }),
  methods: {
    onMouseDown,
    updateHeight,
  },
  watch: {
    value: updateVisibility,
  },
  mounted() {
    window.addEventListener("resize", this.updateHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateHeight);
  },
};
</script>

<style lang="scss" scoped>
.sheet {
  width: 100%;
  position: absolute;
  bottom: 0;
  overflow: hidden;
  visibility: hidden;
  transition: visibility 0s 200ms;
}

.slotWrapper {
  transition: transform 200ms;
}

.visible {
  visibility: visible;
  transition-delay: 0s;
}
</style>