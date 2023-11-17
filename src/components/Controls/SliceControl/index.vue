<template>
  <div v-if="domains.windowWidth && domains.windowLevel">
    <v-card flat class="block">
      <v-card-text class="blockContent" style="padding: 8px 0;">
        <v-container fluid grid-list-sm class="pa-0">
          <v-layout row wrap align-center>
            <v-flex xs2 style="justify-content: center;">
              <label class="smallLabel">窗宽</label>
            </v-flex>
            <v-flex xs7>
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="windowWidth"
                :min="domains.windowWidth.min"
                :max="domains.windowWidth.max"
                :step="domains.windowWidth.step"
              />
            </v-flex>
            <v-flex xs3>
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="windowWidth"
                :min="domains.windowWidth.min"
                :max="domains.windowWidth.max"
                :step="domains.windowWidth.step"
              />
            </v-flex>
            <v-flex xs2 style="justify-content: center;">
              <label class="smallLabel">窗位</label>
            </v-flex>
            <v-flex xs7>
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="windowLevel"
                :min="domains.windowLevel.min"
                :max="domains.windowLevel.max"
                :step="domains.windowLevel.step"
              />
            </v-flex>
            <v-flex xs3>
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="windowLevel"
                :min="domains.windowLevel.min"
                :max="domains.windowLevel.max"
                :step="domains.windowLevel.step"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>

    <v-card flat class="block">
      <v-card-text class="blockContent" style="padding: 8px 0;">

        <v-container fluid grid-list-sm class="pa-0">
          <v-layout row wrap align-center>
            <v-flex
              xs2
              :class="
                isSliceAvailable('x') ||
                (isSliceAvailable('default') && xSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-btn
                class="flex-shrink-0 button"
                fab
                small
                :outlined="!getToggleSliceX()"
                :dark="getToggleSliceX()"
                v-on:click.stop="setToggleSliceX()"
                color="blue-grey"
              >
                <label class="smallLabel">X</label>
              </v-btn>
            </v-flex>
            <v-flex
              xs7
              :class="
                isSliceAvailable('x') ||
                (isSliceAvailable('default') && xSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="xSlice"
                :min="xSliceDomain.min"
                :max="xSliceDomain.max"
                :step="xSliceDomain.step"
              />
            </v-flex>
            <v-flex
              xs3
              :class="
                isSliceAvailable('x') ||
                (isSliceAvailable('default') && xSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="xSlice"
                :min="xSliceDomain.min"
                :max="xSliceDomain.max"
                :step="xSliceDomain.step"
              />
            </v-flex>
            <v-flex
              xs2
              :class="
                isSliceAvailable('y') ||
                (isSliceAvailable('default') && ySliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <div style="position: relative">
                <v-btn
                  class="button"
                  fab
                  small
                  :outlined="!getToggleSliceY()"
                  :dark="getToggleSliceY()"
                  v-on:click.stop="setToggleSliceY()"
                  color="blue-grey"
                >
                  <label class="smallLabel">Y</label>
                </v-btn>
              </div>
            </v-flex>
            <v-flex
              xs7
              :class="
                isSliceAvailable('y') ||
                (isSliceAvailable('default') && ySliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="ySlice"
                :min="ySliceDomain.min"
                :max="ySliceDomain.max"
                :step="ySliceDomain.step"
              />
            </v-flex>
            <v-flex
              xs3
              :class="
                isSliceAvailable('y') ||
                (isSliceAvailable('default') && ySliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="ySlice"
                :min="ySliceDomain.min"
                :max="ySliceDomain.max"
                :step="ySliceDomain.step"
              />
            </v-flex>
            <v-flex
              xs2
              :class="
                isSliceAvailable('z') ||
                (isSliceAvailable('default') && zSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <div style="position: relative">
                <v-btn
                  class="button"
                  fab
                  small
                  :outlined="!getToggleSliceZ()"
                  :dark="getToggleSliceZ()"
                  v-on:click.stop="setToggleSliceZ()"
                  color="blue-grey"
                >
                  <label class="smallLabel">Z</label>
                </v-btn>
              </div>
            </v-flex>
            <v-flex
              xs7
              :class="
                isSliceAvailable('z') ||
                (isSliceAvailable('default') && zSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="zSlice"
                :min="zSliceDomain.min"
                :max="zSliceDomain.max"
                :step="zSliceDomain.step"
              />
            </v-flex>
            <v-flex
              xs3
              :class="
                isSliceAvailable('z') ||
                (isSliceAvailable('default') && zSliceVisibility)
                  ? ''
                  : 'disable'
              "
            >
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="zSlice"
                :min="zSliceDomain.min"
                :max="zSliceDomain.max"
                :step="zSliceDomain.step"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>

    <v-card flat class="block">
      <v-card-text class="blockContent" style="padding: 8px 0 16px 0;">
        <v-container fluid grid-list-sm class="pa-0">
          <v-layout row wrap align-center>
            <v-flex xs2 style="justify-content: center;">
              <label class="smallLabel">透明度</label>
            </v-flex>
            <v-flex xs7>
              <v-slider
                class="slimInput"
                hide-details
                always-dirty
                v-model.number="opacity"
                min="0"
                max="1"
                step="0.01"
              />
            </v-flex>
            <v-flex xs3>
              <v-text-field
                class="slimInput"
                hide-details
                type="number"
                v-model.number="opacity"
                min="0"
                max="1"
                step="0.01"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import helper from "../../Datasets/helper";

function generateSetGet(field) {
  const setMethodName = `set${field}`;
  const getMethodName = `get${field}`;

  function get() {
    let value = null;
    helper.findProxiesWithMethod(this, getMethodName).forEach((proxy) => {
      value = proxy[getMethodName]();
    });
    return value;
  }

  function set() {
    const visibility = !get.apply(this);
    helper.findProxiesWithMethod(this, setMethodName).forEach((proxy) => {
      proxy[setMethodName](visibility);
    });
    this.$forceUpdate();
  }

  return { get, set };
}

function generateSetGetSliceDomain(name) {
  return {
    set() {},
    get() {
      const domain = { ...this.domains[name] };
      if (domain && "min" in domain && "max" in domain) {
        domain.min = Math.floor(domain.min);
        domain.max = Math.floor(domain.max);
      }
      return domain;
    },
  };
}

const FIELDS = [
  { name: "visibility", initialValue: false },
  { name: "windowLevel", initialValue: 900 },
  { name: "windowWidth", initialValue: 33 },
  { name: "xSlice", initialValue: -1 },
  { name: "ySlice", initialValue: -1 },
  { name: "zSlice", initialValue: -1 },
  { name: "xSliceVisibility", initialValue: false },
  { name: "ySliceVisibility", initialValue: false },
  { name: "zSliceVisibility", initialValue: false },
  { name: "opacity", initialValue: 1.0 },
  {
    name: "xSliceDomain",
    computed: generateSetGetSliceDomain("xSlice"),
  },
  {
    name: "ySliceDomain",
    computed: generateSetGetSliceDomain("ySlice"),
  },
  {
    name: "zSliceDomain",
    computed: generateSetGetSliceDomain("zSlice"),
  },
  // Fake props that don't exist on proxy
  {
    name: "toggleSliceX",
    computed: generateSetGet("XSliceVisibility"),
  },
  {
    name: "toggleSliceY",
    computed: generateSetGet("YSliceVisibility"),
  },
  {
    name: "toggleSliceZ",
    computed: generateSetGet("ZSliceVisibility"),
  },
];

function isSliceAvailable(name) {
  return !!this.$proxyManager
    .getViews()
    .filter((v) => v.getContainer())
    .filter((v) => v.getName() === name).length;
}

const OPTS = {};

const component = helper.generateComponent("SliceControl", FIELDS, true, OPTS);
Object.assign(component.methods, {
  isSliceAvailable,
});

export default component;
</script>

<style lang="scss" scoped>
</style>