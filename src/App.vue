<template>
  <div>
    <div id="loader-wrapper" v-if="load">
      <div id="loader"></div>
      <div class="loader-section section-left"></div>
      <div class="loader-section section-right"></div>
      <div class="load_title">
        <span>loading...</span>
      </div>
    </div>
    <v-app v-else>
      <!-- 右侧工具栏 -->
      <v-navigation-drawer
        v-model="drawer"
        :clipped="$vuetify.breakpoint.mdAndUp"
        :mobile-breakpoint="$vuetify.breakpoint.thresholds.sm"
        app
        fixed
        disable-resize-watcher
        touchless
        width="300"
      >
        <Sidebar v-if="land"></Sidebar>
        <v-card
          v-else
          width="400"
          style="height: 100%; flex-direction: column; border-radius: 0"
          :style="{ backgroundColor: theme === true ? 'white' : '#00002A' }"
          :dark="!theme"
        >
          <v-img height="200px" src="./assets/doctor.png"></v-img>

          <v-card-text>
            <div class="font-weight-bold ml-5 mb-2">
              基于百度飞桨的3D医疗数据智能解析平台
            </div>

            <v-timeline
              align-top
              style="margin-left: -20px; margin-right: 10px"
              dense
            >
              <v-timeline-item
                v-for="message in messages"
                :key="message.time"
                :color="message.color"
                small
              >
                <div>
                  <div class="font-weight-normal">
                    <strong>{{ message.from }}</strong>
                  </div>
                  <div>{{ message.message }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-navigation-drawer>
      <!-- 顶部菜单栏 -->
      <v-app-bar elevation="2" app color="indigo" dark clipped-left>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-toolbar-title
          class="font-italic"
          style="font-size: 20px; font-weight: 700"
          ><img
            style="
              margin-right: -5px;
              margin-bottom: -3px;
              transform: skew(-20deg, 0deg);
              height: 22px;
            "
            src="./assets/MedSegLogo.png"
            alt=""
          />
          edicalSeg</v-toolbar-title
        >
        <Navbar></Navbar>
      </v-app-bar>
      <v-main id="appContent">
        <!-- 主视图 -->
        <router-view></router-view>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar/index";
import Navbar from "./components/Navbar/index";
import { mapActions, mapState } from "vuex";

export default {
  name: "App",
  components: {
    Sidebar,
    Navbar,
  },
  mounted() {
    console.log(111);
    setTimeout(() => {
    this.load = false
    }, 500);
  },
  data: () => ({
    drawer: null,
    load: true,
    messages: [
      {
        from: "智能分割",
        message: `点击推理，自动分割腹腔器官作为标签，并3D可视化`,
        color: "indigo  lighten-1",
      },
      {
        from: "预标注效果优化",
        message: "提供笔刷、橡皮擦、多边形标注、提取最大连通域等多种工具",
        color: "deep-purple",
      },
      {
        from: "标签管理",
        message: "支持标签增删、修改、颜色切换、原图像格式导出",
        color: "pink lighten-1",
      },
      {
        from: "多样化工具",
        message: "支持图像缩放、拖动、旋转、窗宽窗位调整、裁剪...",
        color: "orange lighten-1",
      },
      {
        from: "精准测量",
        message: "提供切片直径、面积、体积的定量分析，支持自定义脚本",
        color: "yellow lighten-1",
      },
      {
        from: "计数",
        message: "统计器官数量、病灶(肾癌、肠癌、肝癌)数量，辅助疾病诊断",
        color: "green lighten-1",
      },
    ],
  }),
  computed: {
    ...mapState({
      theme(state) {
        return state.theme;
      },
    }),
    ...mapState("files", {
      land(state) {
        return state.land;
      },
    }),
  },
};
</script>
<style>
#appContent {
  height: 100%;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

.chromeframe {
  margin: 0.2em 0;
  background: #ccc;
  color: #000;
  padding: 0.2em 0;
}
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
}
#loader {
  display: block;
  position: relative;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  border-radius: 50%;
  border: 3px solid transparent;
  /* COLOR 1 */
  border-top-color: #fff;
  -webkit-animation: spin 2s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -ms-animation: spin 2s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -moz-animation: spin 2s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -o-animation: spin 2s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  animation: spin 2s linear infinite;
  /* Chrome, Firefox 16+, IE 10+, Opera */
  z-index: 1001;
}
#loader:before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 3px solid transparent;
  /* COLOR 2 */
  border-top-color: #fff;
  -webkit-animation: spin 3s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -moz-animation: spin 3s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -o-animation: spin 3s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -ms-animation: spin 3s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  animation: spin 3s linear infinite;
  /* Chrome, Firefox 16+, IE 10+, Opera */
}
#loader:after {
  content: "";
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #fff;
  /* COLOR 3 */
  -moz-animation: spin 1.5s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -o-animation: spin 1.5s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -ms-animation: spin 1.5s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  -webkit-animation: spin 1.5s linear infinite;
  /* Chrome, Opera 15+, Safari 5+ */
  animation: spin 1.5s linear infinite;
  /* Chrome, Firefox 16+, IE 10+, Opera */
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: rotate(0deg);
    /* IE 9 */
    transform: rotate(0deg);
    /* Firefox 16+, IE 10+, Opera */
  }
  100% {
    -webkit-transform: rotate(360deg);
    /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: rotate(360deg);
    /* IE 9 */
    transform: rotate(360deg);
    /* Firefox 16+, IE 10+, Opera */
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: rotate(0deg);
    /* IE 9 */
    transform: rotate(0deg);
    /* Firefox 16+, IE 10+, Opera */
  }
  100% {
    -webkit-transform: rotate(360deg);
    /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: rotate(360deg);
    /* IE 9 */
    transform: rotate(360deg);
    /* Firefox 16+, IE 10+, Opera */
  }
}
#loader-wrapper .loader-section {
  position: fixed;
  top: 0;
  width: 51%;
  height: 100%;
  background: #7171c6;
  /* Old browsers */
  z-index: 1000;
  -webkit-transform: translateX(0);
  /* Chrome, Opera 15+, Safari 3.1+ */
  -ms-transform: translateX(0);
  /* IE 9 */
  transform: translateX(0);
  /* Firefox 16+, IE 10+, Opera */
}
#loader-wrapper .loader-section.section-left {
  left: 0;
}
#loader-wrapper .loader-section.section-right {
  right: 0;
}
/* Loaded */
.loaded #loader-wrapper .loader-section.section-left {
  -webkit-transform: translateX(-100%);
  /* Chrome, Opera 15+, Safari 3.1+ */
  -ms-transform: translateX(-100%);
  /* IE 9 */
  transform: translateX(-100%);
  /* Firefox 16+, IE 10+, Opera */
  -webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.loaded #loader-wrapper .loader-section.section-right {
  -webkit-transform: translateX(100%);
  /* Chrome, Opera 15+, Safari 3.1+ */
  -ms-transform: translateX(100%);
  /* IE 9 */
  transform: translateX(100%);
  /* Firefox 16+, IE 10+, Opera */
  -webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.loaded #loader {
  opacity: 0;
  -webkit-transition: all 0.3s ease-out;
  transition: all 0.3s ease-out;
}
.loaded #loader-wrapper {
  visibility: hidden;
  -webkit-transform: translateY(-100%);
  /* Chrome, Opera 15+, Safari 3.1+ */
  -ms-transform: translateY(-100%);
  /* IE 9 */
  transform: translateY(-100%);
  /* Firefox 16+, IE 10+, Opera */
  -webkit-transition: all 0.3s 1s ease-out;
  transition: all 0.3s 1s ease-out;
}
/* JavaScript Turned Off */
.no-js #loader-wrapper {
  display: none;
}
.no-js h1 {
  color: #222222;
}
#loader-wrapper .load_title {
  font-family: "Open Sans";
  color: #fff;
  font-size: 19px;
  width: 100%;
  text-align: center;
  z-index: 9999999999999;
  position: absolute;
  top: 60%;
  opacity: 1;
  line-height: 30px;
}
#loader-wrapper .load_title span {
  font-weight: normal;
  font-style: italic;
  font-size: 13px;
  color: #fff;
  opacity: 0.5;
}
</style>