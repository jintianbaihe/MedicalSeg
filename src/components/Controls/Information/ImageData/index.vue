<template>
  <v-card flat class="block" v-if="dataset.isA('vtkImageData')">
    <v-card-text class="blockContent">
      <v-container fluid grid-list-xs class="pa-0">
        <v-layout row align-center>
          <v-flex xs4 class="body-2">体素:</v-flex>
          <v-flex xs8 class="body-2 canSelect">
            ({{ showVect(dataset.getSpacing()) }})
          </v-flex>
        </v-layout>
        <v-layout row align-center>
          <v-flex xs4 class="body-2">维数:</v-flex>
          <v-flex xs8 class="body-2 canSelect">
            ({{ showVect(dataset.getDimensions(), ", ") }})
          </v-flex>
        </v-layout>
        <v-layout row align-center>
          <v-flex xs4 class="body-2">原点坐标:</v-flex>
          <v-flex xs8 class="body-2 canSelect">
            ({{ showVect(dataset.getOrigin()) }})
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import MatrixView from "../MatrixView";

export default {
  name: "ImageDataInformation",
  props: ["dataset"],
  components: {
    MatrixView,
  },
  methods: {
    showVect: (vect, d = ", ") => vect.map((c) => c.toFixed(2)).join(d),
  },
};
</script>

<style lang="scss" scoped>
</style>