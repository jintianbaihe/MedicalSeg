<template>
<div
  v-if="available"
>
  <vtk-image-data :dataset="source.getDataset()" />
</div>

</template>

<script>
import VtkImageData from './ImageData';

export default {
  name: 'Information',
  props: ['sourceId'],
  components: {
    VtkImageData,
  },
  computed: {
    source() {
      return this.$proxyManager.getProxyById(this.sourceId);
    },
    available() {
      if (this.source) {
        const ds = this.source.getDataset();
        if (ds && ds.isA) {
          return ds.isA('vtkPolyData') || ds.isA('vtkImageData');
        }
      }
      return false;
    },
  },
};

</script>

<style lang="scss" scoped>

</style>