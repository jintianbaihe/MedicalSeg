<template>
<div
  v-if="domains.representation || domains.opacity || domains.sampleDistance"
>
  <v-card flat class="block" v-if="domains.representation">
    <v-container fluid grid-list-xs class="pa-0">
      <v-layout row wrap align-center>
        <v-flex xs12>
          <v-select
            dense
            flat
            label="Type"
            v-model="representation"
            :items="domains.representation.items"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
  <v-card flat class="block" v-if="domains.opacity && domains.pointSize">
    <v-card-title flat class="blockTitle">
      <span class="body-2">Mesh</span>
    </v-card-title>
    <v-card-text class="blockContent">
      <v-container fluid grid-list-xs class="pa-0">
        <v-layout row wrap align-center>
          <v-flex xs3>
            <label class="smallLabel">Point Size</label>
          </v-flex>
          <v-flex xs6>
            <v-slider
              class="slimInput"
              hide-details
              always-dirty
              v-model="pointSize"
              :min="domains.pointSize.min"
              :max="domains.pointSize.max"
              :step="domains.pointSize.step"
            />
          </v-flex>
          <v-flex xs3>
            <v-text-field
              class="slimInput"
              hide-details
              type="number"
              v-model="pointSize"
              :min="domains.pointSize.min"
              :max="domains.pointSize.max"
              :step="domains.pointSize.step"
            />
          </v-flex>
          <v-flex xs3>
            <label class="smallLabel">Opacity</label>
          </v-flex>
          <v-flex xs6>
            <v-slider
              class="slimInput"
              hide-details
              always-dirty
              v-model="opacity"
              :min="domains.opacity.min"
              :max="domains.opacity.max"
              :step="domains.opacity.step"
            />
          </v-flex>
          <v-flex xs3>
            <v-text-field
              class="slimInput"
              hide-details
              type="number"
              :min="domains.opacity.min"
              :max="domains.opacity.max"
              :step="domains.opacity.step"
              :value="opacity"
              @input="opacity = Number($event)"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
  <v-card flat class="block" v-if="domains.sampleDistance && domains.edgeGradient">
    <v-card-text class="blockContent" style="padding: 8px 0;margin-bottom: 10px;">
      <v-container fluid grid-list-xs class="pa-0">
        <v-layout row wrap align-center>
          <v-flex xs3>
            <label class="smallLabel">采样步长</label>
          </v-flex>
          <v-flex xs6>
            <v-slider
              class="slimInput"
              hide-details
              always-dirty
              v-model="sampleDistance"
              :min="domains.sampleDistance.min"
              :max="domains.sampleDistance.max"
              :step="domains.sampleDistance.step"
            />
          </v-flex>
          <v-flex xs3>
            <v-text-field
              class="slimInput"
              hide-details
              type="number"
              v-model="sampleDistance"
              :min="domains.sampleDistance.min"
              :max="domains.sampleDistance.max"
              :step="domains.sampleDistance.step"
            />
          </v-flex>
          <v-flex xs3>
            <label class="smallLabel">边缘梯度</label>
          </v-flex>
          <v-flex xs6>
            <v-slider
              class="slimInput"
              hide-details
              always-dirty
              v-model="edgeGradient"
              :min="domains.edgeGradient.min"
              :max="domains.edgeGradient.max"
              :step="domains.edgeGradient.step"
            />
          </v-flex>
          <v-flex xs3>
            <v-text-field
              class="slimInput"
              hide-details
              type="number"
              v-model="edgeGradient"
              :min="domains.edgeGradient.min"
              :max="domains.edgeGradient.max"
              :step="domains.edgeGradient.step"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</div>

</template>

<script>
import helper from '../../Datasets/helper';

const FIELDS = [
  { name: 'pointSize', initialValue: 1 },
  { name: 'opacity', initialValue: 1 },
  { name: 'sampleDistance', initialValue: 1 },
  { name: 'edgeGradient', initialValue: 1 },
  { name: 'representation', initialValue: 'Surface' },
];

const component = helper.generateComponent("Representation", FIELDS);
export default component;
</script>

<style lang="scss" scoped>

</style>