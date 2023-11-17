import Vue from "vue";
import Vuex from "vuex";
import view from "./view";
import widgets from "./widgets";
import files from "./fileLoader";
import animations from "./animations";
import vtkProxyManager from "@kitware/vtk.js/Proxy/Core/ProxyManager";
import {
  wrapMutationAsAction,
  createRepresentationInAllViews,
} from "../plugins/utils";

Vue.use(Vuex);

function getViewType(view) {
  return `${view.getProxyName()}:${view.getName()}`;
}

function stepActiveSlice(proxyManager, inc) {
  const view = proxyManager.getActiveView();
  const source = proxyManager.getActiveSource();
  const r = proxyManager.getRepresentation(source, view);
  const domain = r.getPropertyDomainByName("slice");
  if (r.isA("vtkSliceRepresentationProxy") && domain) {
    const step = inc ? domain.step : -domain.step;
    const slice = Math.min(
      domain.max,
      Math.max(domain.min, r.getSlice() + step)
    );
    r.setSlice(slice);
    proxyManager.resizeAllViews();
  }
}

function createStore(injected) {
  const { girder } = injected;
  let { proxyManager } = injected;
  if (!proxyManager) {
    proxyManager = vtkProxyManager.newInstance({
      proxyConfiguration: Config.Proxy,
    });
  }

  const animationManager = proxyManager.createProxy(
    "AnimationManager",
    "AnimationProxyManager"
  );

  const $store = new Vuex.Store({
    state: {
      proxyManager,
      theme: true,
      panels: {},
      collapseDatasetPanels: false,
      mostRecentViewPoint: null,
      cameraViewPoints: {},
    },
    modules: {
      view: view({ proxyManager, girder }),
      files: files({ proxyManager, girder }),
      widgets: widgets({ proxyManager, girder }),
      animations: animations({ animationManager }),
    },
    getters: {
      proxyManager(state) {
        return state.proxyManager;
      },
      mostRecentViewPoint(state) {
        return state.mostRecentViewPoint;
      },
      cameraViewPoints(state) {
        return state.cameraViewPoints;
      },
    },
    mutations: {
      setTheme(state, theme) {
        state.theme = theme;
        console.log(theme)
      },
      addPanel: (state, { component, priority = 0 }) => {
        if (!(priority in state.panels)) {
          Vue.set(state.panels, priority, []);
        }
        state.panels[priority].push(component);
      },
      mostRecentViewPoint(state, viewPoint) {
        state.mostRecentViewPoint = viewPoint;
      },
    },
    actions: {
      setTheme: wrapMutationAsAction("setTheme"),
      addPanel: wrapMutationAsAction("addPanel"),
      setCameraViewPoints({ dispatch, state }, viewPoints) {
        state.cameraViewPoints = viewPoints;
        const keys = Object.keys(viewPoints);
        if (keys.length !== 0) {
          // Set the camera to the first view point
          dispatch("changeCameraViewPoint", keys[0]);

          // Begin first person interaction
          const interactionStyle = "FirstPerson";
          dispatch("views/setInteractionStyle3D", interactionStyle);
        }
      },
      increaseSlice({ state }) {
        stepActiveSlice(proxyManager, true);
      },
      decreaseSlice({ state }) {
        stepActiveSlice(proxyManager, false);
      },
      resetActiveCamera() {
        proxyManager.resetCamera();
      },
      previousViewPoint({ dispatch, getters }) {
        const lastViewPoint = getters.mostRecentViewPoint;
        if (!lastViewPoint) {
          // Nothing to do
          return;
        }

        const keys = Object.keys(getters.cameraViewPoints);
        if (!keys.includes(lastViewPoint)) {
          return;
        }

        const length = keys.length;
        const ind = (keys.indexOf(lastViewPoint) + length - 1) % length;
        dispatch("changeCameraViewPoint", keys[ind]);
      },
      nextViewPoint({ dispatch, getters }) {
        const lastViewPoint = getters.mostRecentViewPoint;
        if (!lastViewPoint) {
          // Nothing to do
          return;
        }

        const keys = Object.keys(getters.cameraViewPoints);
        if (!keys.includes(lastViewPoint)) {
          return;
        }

        const ind = (keys.indexOf(lastViewPoint) + 1) % keys.length;
        dispatch("changeCameraViewPoint", keys[ind]);
      },

      changeCameraViewPoint({ commit, getters, state }, viewPointKey) {
        const allViews = state.proxyManager.getViews();
        const pxManager = getters.proxyManager;

        const viewPoints = getters.cameraViewPoints[viewPointKey] || {};
        const camera = viewPoints.camera;
        const showSources = viewPoints.show;
        const hideSources = viewPoints.hide;

        const moveCameraPromiseList = [];

        allViews
          .filter((v) => v.getName() === "default")
          .forEach((v) => {
            // Keep the same focal distance, or else some kind of
            // shaking sometimes happens during camera interaction.
            const distance = v.getCamera().getDistance();
            const direction = [
              camera.focalPoint[0] - camera.position[0],
              camera.focalPoint[1] - camera.position[1],
              camera.focalPoint[2] - camera.position[2],
            ];

            const adjustedFocalPoint = [
              camera.position[0] + direction[0] * distance,
              camera.position[1] + direction[1] * distance,
              camera.position[2] + direction[2] * distance,
            ];

            const promise = v.moveCamera(
              adjustedFocalPoint,
              camera.position,
              camera.viewUp,
              100
            );
            moveCameraPromiseList.push(promise);
          });

        Promise.all(moveCameraPromiseList).then(() => {
          // Modify the source visibilities from the view point settings
          pxManager.getSources().forEach((source) => {
            const name = source.getName();

            if (!showSources.includes(name) && !hideSources.includes(name)) {
              // Don't change the visibility
              return;
            }

            const visible = showSources.includes(name);

            const rep = pxManager
              .getRepresentations()
              .filter((r) => r.getInput() === source)[0];

            if (rep.getVisibility() !== visible) {
              rep.setVisibility(visible);
            }
          });

          pxManager.renderAllViews();
        });

        commit("mostRecentViewPoint", viewPointKey);
      },
      takeScreenshot({ commit, state }, viewToUse = null) {
        const view = viewToUse || proxyManager.getActiveView();
        const viewType = getViewType(view);
        if (view) {
          return view.captureImage().then((imgSrc) => {
            const link = document.createElement("a");
            link.href = imgSrc;
            link.download = view.getName() + ".png";
            link.click();
          });
        }
        return Promise.resolve();
      },
    },
  });
  proxyManager.set({ $store }, true);
  return $store;
}

export default createStore;
