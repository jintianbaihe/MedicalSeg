import Vue from 'vue'
import Vuex from 'vuex';
import App from './App.vue'
import router from './router'
import GirderProvider from './plugins/girder';
import createStore from './store'
import Config from './config';
import ace from 'ace-builds'
import Vuetify from 'vuetify';
import PortalVue from 'portal-vue';
import { vuetify as girderVuetify } from '@girder/components/src';
import elementui from "element-ui"
import echarts from "./plugins/echarts"
import ReaderFactory from './io/ReaderFactory';
import { registerToMedicalSeg } from './io/ITKReader';
import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import { ProxyManagerVuePlugin } from './plugins/plugins';
import 'vuetify/dist/vuetify.min.css'
import "./assets/css/style.css"
import 'element-ui/lib/theme-chalk/index.css'
import "@kitware/vtk.js/favicon";
import '@kitware/vtk.js/Rendering/Profiles/All';
import './config/ColorMaps';
import ToolSvgPortalPlugin from './plugins/toolSvgPortal';

export const {
  getReader,
  importBase64Dataset,
  listReaders,
  listSupportedExtensions,
  loadFiles,
  openFiles,
  registerReader,
  registerReadersToProxyManager,
} = ReaderFactory;

Vue.use(ace)
Vue.use(Vuex);
Vue.use(Vuetify);
Vue.use(elementui);
Vue.use(ProxyManagerVuePlugin);
Vue.prototype.$echarts = echarts
Vue.use(PortalVue);
Vue.use(ToolSvgPortalPlugin);

Vue.config.productionTip = false

let activeProxyConfig = null;
let proxyConfig = null;

export function setActiveProxyConfiguration(config) {
  activeProxyConfig = config;
}

const proxyConfiguration = proxyConfig || activeProxyConfig || Config.Proxy;
const proxyManager = vtkProxyManager.newInstance({ proxyConfiguration });

const store = createStore({
  proxyManager,
  girder: GirderProvider,
});

registerToMedicalSeg(ReaderFactory);

new Vue({
  router,
  store,
  proxyManager,
  vuetify: girderVuetify,
  provide: GirderProvider,
  render: h => h(App)
}).$mount('#app')
