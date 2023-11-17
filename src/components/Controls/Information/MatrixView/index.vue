<template>
<v-container class="pa-1">
  <v-layout
    row
    align-center
    v-for="i in rows"
    :key="i"
  >
    <v-flex
      v-for="j in columns"
      :key="i*rows+j"
    >
      <span class="canSelect">
        {{ (matrix[(i-1)*rows + (j-1)]).toFixed(2) }}
      </span>
    </v-flex>
  </v-layout>
</v-container>

</template>

<script>
export default {
  name: 'MatrixViewInformation',
  props: {
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    matrix: { required: true },
  },
};

</script>

<style lang="scss" scoped>

</style>