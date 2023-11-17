<template>
  <div
    v-on:dragover.prevent="onDragOver"
    v-on:dragleave="onDragLeave"
    v-on:drop.prevent="onDrop"
    class="dragfilebox"
  >
    <slot :dragHover="dragHover" />
  </div>
</template>

<script>
function onDragOver(ev) {
  if (this.enabled) {
    const types = ev.dataTransfer.types;
    if (
      types && types instanceof Array
        ? types.indexOf("Files") !== -1
        : "Files" in types
    ) {
      this.dragHover = true;
      if (this.dragTimeout !== null) {
        window.clearTimeout(this.dragTimeout);
        this.dragTimeout = null;
      }
    }
  }
}

function onDragLeave() {
  if (this.enabled) {
    this.dragTimeout = window.setTimeout(() => {
      this.dragHover = false;
      this.dragTimeout = null;
    }, 50);
  }
}

function onDrop(ev) {
  if (this.enabled) {
    this.$emit("drop", Array.from(ev.dataTransfer.files));
    this.dragHover = false;
  }
}

export default {
  name: "dragFile",
  props: {
    enabled: Boolean,
  },
  data() {
    return {
      dragHover: false,
    };
  },
  methods: {
    onDragOver,
    onDragLeave,
    onDrop,
  },
  created() {
    this.dragTimeout = null;
  },
};
</script>

<style lang="scss" scoped>
.dragfilebox :hover {
  cursor: pointer;
}
</style>