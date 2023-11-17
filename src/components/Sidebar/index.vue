<template>
  <v-tabs :dark="!theme" v-model="activeTab" grow centered class="tabsContainer">
    <v-tab>数据集</v-tab>
    <v-tab>工具组</v-tab>
    <v-tab>数据分析</v-tab>
    <v-tabs-items :dark="!theme" v-model="activeTab" touchless class="tabItems">
      <v-tab-item  class="tabItem">
        <Datasets />
      </v-tab-item>
      <v-tab-item class="tabItem">
        <Tools />
      </v-tab-item>
      <v-tab-item class="tabItem">
        <Statistic />
      </v-tab-item>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
import Datasets from "../Datasets/index.vue";
import Tools from "../Tools/index.vue";
import Statistic from "../Statistic/index.vue";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Sidebar",

  components: {
    Datasets,
    Tools,
    Statistic,
  },

  data() {
    return {};
  },
  computed: {
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    activeTab: {
      set(val) {
        this.setActiveTab(val);
      },
      get() {
        return this.$store.state.view.activeTab;
      },
    },
  },
  mounted() {},

  methods: {
    ...mapActions("view", ["setActiveTab"]),
  },
};
</script>

<style lang="scss" scoped>
.tabsContainer {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.tabItems {
  flex: 2;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-flow: column;
}

.tabItems > :global(.v-window__container) {
  height: 100%;
}

.tabItem {
  height: 100%;
  display: flex;
  flex-flow: column;
}

.tabComponent {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>