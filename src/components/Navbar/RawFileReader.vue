<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-container grid-list-xs class="pa-0">
          <v-layout row align-center>
            <v-flex xs3 class="body-2">文件大小:</v-flex>
            <v-flex xs9 class="body-1">{{ file.size }} bytes</v-flex>
          </v-layout>
          <v-layout row align-center>
            <v-flex xs3 class="body-2">数据类型:</v-flex>
            <v-flex xs9 class="body-1">
              <v-select
                :items="allDataTypes"
                v-model="dataType"
                item-text="label"
                item-value="label"
                single-line
                return-object
              />
            </v-flex>
          </v-layout>
          <v-layout row align-center>
            <v-flex xs3 class="body-2">维数:</v-flex>
            <v-flex v-for="i in 3" :key="i" xs3 class="body-1">
              <v-text-field
                type="number"
                min="1"
                :max="file.size"
                v-model="dimensions[i - 1]"
              />
            </v-flex>
          </v-layout>
          <v-layout row align-center>
            <v-flex xs3 class="body-2">体素:</v-flex>
            <v-flex v-for="i in 3" :key="i" xs3 class="body-1">
              <v-text-field
                type="number"
                min="1"
                :max="file.size"
                v-model="spacing[i - 1]"
              />
            </v-flex>
          </v-layout>
          <v-layout row align-center>
            <v-flex xs3>有效规格:</v-flex>
            <v-flex xs3>{{ effectiveSize }}</v-flex>
            <v-flex xs6>
              <span v-if="effectiveSize !== file.size" class="red--text">
                规格不匹配!
              </span>
              <span v-else class="teal--text">匹配成功</span>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
const DATA_TYPES = [
  {
    label: "Integer 8",
    constructor: Int8Array,
    size: 1,
  },
  {
    label: "Unsigned Integer 8",
    constructor: Uint8Array,
    size: 1,
  },
  {
    label: "Integer 16",
    constructor: Int16Array,
    size: 2,
  },
  {
    label: "Unsigned Integer 16",
    constructor: Uint16Array,
    size: 2,
  },
  {
    label: "Integer 32",
    constructor: Int32Array,
    size: 4,
  },
  {
    label: "Unsigned Integer 32",
    constructor: Uint32Array,
    size: 4,
  },
  {
    label: "Float",
    constructor: Float32Array,
    size: 4,
  },
  {
    label: "Double",
    constructor: Float64Array,
    size: 8,
  },
];

function onChange() {
  if (this.effectiveSize === this.file.size) {
    this.$emit("change", {
      dimensions: this.dimensions,
      spacing: this.spacing,
      dataType: this.dataType,
      effectiveSize: this.effectiveSize,
    });
  } else {
    this.$emit("change", null);
  }
}

export default {
  name: "RawFileReader",
  props: {
    file: {
      type: File,
      required: true,
    },
  },
  data() {
    return {
      allDataTypes: DATA_TYPES,
      dataType: DATA_TYPES[0],
      dimensions: [512, 512, 1],
      spacing: [1, 1, 1],
    };
  },
  watch: {
    dimensions: onChange,
    spacing: onChange,
    dataType: onChange,
  },
  computed: {
    effectiveSize() {
      return this.dimensions.reduce((t, v) => t * v, 1) * this.dataType.size;
    },
  },
  methods: {
    pastespec(dataType, dimensions, spacing) {
      let d = DATA_TYPES.filter((d) => d.label === dataType);
      this.dataType = d[0];
      this.dimensions = dimensions;
      this.spacing = spacing;
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbarButton span {
  margin-left: 4px;
}

.overlay {
  position: absolute;
  z-index: 5;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  user-select: none;
}

.overlayHidden {
  visibility: hidden;
}

.overlayText {
  position: relative;
  top: 45%;
  transform: translateY(-50%);
  width: 80%;
  margin: auto;
}
</style>