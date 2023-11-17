import JSZip from "jszip";
import ReaderFactory from "../io/ReaderFactory";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import axios from "axios";
import Vue from "vue";
import vtkLabelMap from "../config/vtk/LabelMap";
import { wrapMutationAsAction } from "../plugins/utils";
import { createRepresentationInAllViews } from "../plugins/utils";
import { baseurl } from "../plugins/axios";
axios.defaults.baseURL = "http://" + baseurl + ":5000";

export function getSupportedExtensions() {
  return ["zip", "raw", "gz", "mhd"].concat(
    ReaderFactory.listSupportedExtensions()
  );
}

export function fromHex(colorStr) {
  const hex = colorStr.slice(1);
  const colorArray = [];
  for (let i = 0; i < hex.length; i += 2) {
    colorArray.push(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return colorArray;
}

export function createLabelMapFromImage(imageData) {
  const labelMap = vtkLabelMap.newInstance(
    imageData.get("spacing", "origin", "direction")
  );
  labelMap.setDimensions(imageData.getDimensions());

  const values = new Uint16Array(imageData.getNumberOfPoints());
  const dataArray = vtkDataArray.newInstance({
    numberOfComponents: 1,
    values,
  });
  labelMap.getPointData().setScalars(dataArray);

  labelMap.computeTransforms();
  return labelMap;
}

function readRawFile(file, { dimensions, spacing, dataType }) {
  return new Promise((resolve, reject) => {
    const fio = new FileReader();
    fio.onload = function onFileReaderLoad() {
      const dataset = vtkImageData.newInstance({
        spacing,
        extent: [
          0,
          dimensions[0] - 1,
          0,
          dimensions[1] - 1,
          0,
          dimensions[2] - 1,
        ],
      });
      const scalars = vtkDataArray.newInstance({
        name: "Scalars",
        values: new dataType.constructor(fio.result),
      });
      dataset.getPointData().setScalars(scalars);

      resolve(dataset);
    };

    fio.onerror = (error) => reject(error);

    fio.readAsArrayBuffer(file);
  });
}

export function getExtension(filename) {
  const i = filename.lastIndexOf(".");
  if (i > -1) {
    return filename.substr(i + 1).toLowerCase();
  }
  return "";
}

function zipGetSupportedFiles(zip, path) {
  const supportedExts = getSupportedExtensions();
  const promises = [];
  zip.folder(path).forEach((relPath, file) => {
    if (file.dir) {
      promises.push(zipGetSupportedFiles(zip, relPath));
    } else if (supportedExts.indexOf(getExtension(file.name)) > -1) {
      const splitPath = file.name.split("/");
      const baseName = splitPath[splitPath.length - 1];
      promises.push(
        zip
          .file(file.name)
          .async("blob")
          .then((blob) => new File([blob], baseName))
      );
    }
  });
  return promises;
}

export default ({ proxyManager }) => ({
  namespaced: true,
  state: {
    land: false,
    files: {},
    fileList: [],
    activeSourceId: -1,
    showOpenFileDialog: false,
    showLabelUpAndDownDialog: false,
  },
  getters: {
    getFiles(state) {
      return state.fileList;
    },
  },
  mutations: {
    setActiveSourceId(state, sourceId) {
      state.activeSourceId = sourceId;
    },
    setFileId(
      state,
      { proxyId, id, fileStatus, inferObj, inferObjStatus, inferStatus }
    ) {
      let file = {
        fileId: id,
        fileStatus: fileStatus,
        inferObj: inferObj,
        inferObjStatus: inferObjStatus,
        inferStatus: inferStatus,
      };
      Vue.set(state.files, proxyId, file, inferStatus);
      // state.files[proxyId] = file;
    },
    resetQueue(state) {
      state.fileList = [];
    },
    setLandStatus(state, value) {
      state.land = value;
    },
    setOpenFileDialog(state, value) {
      state.showOpenFileDialog = value;
    },
    setLabelUpAndDownDialog(state, value) {
      state.showLabelUpAndDownDialog = value;
    },
    setFileProxyId(state, { index, value }) {
      state.fileList[index].proxyId = value;
    },
    setFileReader(state, { index, reader }) {
      if (reader && index >= 0 && index < state.fileList.length) {
        state.fileList[index].reader = reader;
        state.fileList[index].state = "ready";
      }
    },
    setFileReady(state, index) {
      if (index >= 0 && index < state.fileList.length) {
        state.fileList[index].state = "ready";
      }
    },
    setRawFileInfo(state, { index, info }) {
      if (info && index >= 0 && index < state.fileList.length) {
        state.fileList[index].extraInfo = info;
        state.fileList[index].state = "loading";
      }
    },
    setFileNeedsInfo(state, index) {
      if (index >= 0 && index < state.fileList.length) {
        state.fileList[index].state = "needsInfo";
        state.fileList[index].extraInfo = null;
      }
    },
    deleteFile(state, index) {
      if (index >= 0 && index < state.fileList.length) {
        state.fileList.splice(index, 1);
      }
    },
    addFile(state, file) {
      state.fileList.push(file);
    },
    addToFileList(state, files) {
      for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        const fileState = {
          state: "loading",
          name: fileInfo.name,
          ext: getExtension(fileInfo.name),
          label: null,
          files: null,
          reader: null,
          extraInfo: null,
          withGirderToken: false,
          proxyKeys: fileInfo.proxyKeys,
        };
        if (fileInfo.type === "dicom") {
          fileState.files = fileInfo.list;
          fileState.ext = "dcm";
        }
        if (fileInfo.type === "regular" || fileInfo.type === "mhd") {
          fileState.files = [fileInfo.file];
        }
        if (fileInfo.type === "mhd") {
          fileState.files = [fileInfo.file];
        }
        if (fileInfo.type === "label") {
          fileState.files = [fileInfo.file];
          fileState.label = [fileInfo.sourceId][0];
        }
        state.fileList.push(fileState);
      }
    },
  },
  actions: {
    setActiveSourceId: wrapMutationAsAction("setActiveSourceId"),
    setFileId(
      { commit },
      { proxyId, id, fileStatus, inferObj, inferObjStatus, inferStatus }
    ) {
      commit("setFileId", {
        proxyId: proxyId,
        id: id,
        fileStatus: fileStatus,
        inferObj: inferObj,
        inferObjStatus: inferObjStatus,
        inferStatus: inferStatus,
      });
    },
    resetQueue({ commit }) {
      commit("resetQueue");
    },
    promptLocal({ dispatch }) {
      const exts = getSupportedExtensions();
      return new Promise((resolve, reject) =>
        ReaderFactory.openFiles(exts, (files) => {
          dispatch("openFiles", Array.from(files)).then(resolve).catch(reject);
        })
      );
    },
    setRawFileInfo({ commit, dispatch }, { index, info }) {
      if (info) {
        commit("setRawFileInfo", { index, info });
      } else {
        commit("setFileNeedsInfo", index);
      }
      return dispatch("readFileIndex", index);
    },
    deleteFile({ commit }, index) {
      commit("deleteFile", index);
    },
    setOpenFileDialog({ commit, dispatch }, FileDialogStatus) {
      commit("setOpenFileDialog", FileDialogStatus);
    },
    setLabelUpAndDownDialog({ commit, dispatch }, FileDialogStatus) {
      commit("setLabelUpAndDownDialog", FileDialogStatus);
    },
    uploadFileMhd({ commit, dispatch, state }, file) {
      return new Promise((resolve, reject) => {
        let param = new FormData();
        param.append("files", file);
        axios
          .post("/uploadFileMhd", param, {
            "Content-type": "multipart/form-data",
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((res) => {
            resolve(res.data);
          });
      });
    },
    uploadFileDcm({ commit, dispatch, state }, files) {
      return new Promise((resolve, reject) => {
        let param = new FormData();
        files = Array.from(files);
        files.forEach((file) => {
          param.append("files", file);
        });
        axios
          .post("/uploadFileDcm", param, {
            "Content-type": "multipart/form-data",
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((res) => {
            resolve(res.data);
          });
      });
    },
    uploadFiles({ commit, dispatch, state }, f) {
      if (f.ext != "mhd" && f.ext != "dcm") {
        let param = new FormData();
        let file = f.file.files;
        param.append("files", file[0]);
        axios
          .post("/uploadFiles", param, {
            "Content-type": "multipart/form-data",
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((res) => {
            console.log(res);
            commit("setFileId", {
              proxyId: f.file.proxyId,
              id: res.data.data.fileId,
              fileStatus: "toinfer",
              inferObj: "器官分割",
              inferObjStatus: {
                organ: "toinfer",
                kidney: "toinfer",
                colon: "toinfer",
                liver: "toinfer",
              },
              inferStatus: false,
            });
          });
      }
    },
    openDcmFiles({ commit, dispatch }, files) {
      const dicomFileList = [];
      files.forEach((f) => {
        dicomFileList.push(f);
      });
      if (dicomFileList.length) {
        let dcmfilename = dicomFileList[0].name;
        if (getExtension(dicomFileList[0].name) == "") {
          dcmfilename = dcmfilename + ".dcm";
        }
        const dicomFile = {
          type: "dicom",
          name: dcmfilename,
          list: dicomFileList,
        };
        commit("addToFileList", [dicomFile]);
      }
      dispatch("uploadFileDcm", files).then((res) => {
        console.log(res);
      });
      return dispatch("readAllFiles");
    },
    openLabelFiles({ commit, dispatch }, { files, sourceId }) {
      const labelFileList = [];
      files.forEach((f) => {
        labelFileList.push(f);
      });
      commit(
        "addToFileList",
        labelFileList.map((f) => ({
          type: "label",
          name: f.name,
          file: f,
          sourceId: sourceId,
        }))
      );
      return dispatch("readAllFiles");
    },
    openFiles({ commit, dispatch }, files) {
      commit("setOpenFileDialog", true);
      const zips = files.filter((f) => getExtension(f.name) === "zip");
      if (zips.length) {
        const nonzips = files.filter((f) => getExtension(f.name) !== "zip");
        const p = zips.map((file) =>
          JSZip.loadAsync(file).then((zip) =>
            Promise.all(zipGetSupportedFiles(zip))
          )
        );
        return Promise.all(p)
          .then((results) => [].concat.apply(nonzips, results))
          .then((newFileList) => dispatch("openFiles", newFileList));
      }

      const regularFileList = [];
      const dicomFileList = [];
      const mhdFileList = [];
      files.forEach((f) => {
        if (getExtension(f.name) === "dcm") {
          dicomFileList.push(f);
        } else if (getExtension(f.name) === "mhd") {
          mhdFileList.push(f);
        } else {
          regularFileList.push(f);
        }
      });

      commit(
        "addToFileList",
        regularFileList.map((f) => ({
          type: "regular",
          name: f.name,
          file: f,
        }))
      );
      dispatch(
        "addMhdToFileList",
        mhdFileList.map((f) => ({
          type: "mhd",
          name: f.name,
          file: f,
        }))
      );
      return dispatch("readAllFiles");
    },
    addMhdToFileList({ dispatch, commit, state }, files) {
      for (let i = 0; i < files.length; i++) {
        dispatch("uploadFileMhd", files[i].file).then((res) => {
          const fileInfo = files[i];
          const fileState = {
            state: "ready",
            name: fileInfo.name,
            ext: getExtension(fileInfo.name),
            files: null,
            reader: null,
            extraInfo: null,
            withGirderToken: false,
            proxyKeys: fileInfo.proxyKeys,
            dimension: res.data.dimSize,
            spacing: res.data.elementSpacing,
            dataType: res.data.elementType,
          };
          commit("addFile", fileState);
        });
      }
    },

    readAllFiles({ dispatch, commit, state }) {
      const readPromises = [];
      for (let i = 0; i < state.fileList.length; i++) {
        readPromises.push(dispatch("readFileIndex", i));
      }
      return Promise.all(readPromises);
    },

    readFileIndex({ commit, dispatch, state }, fileIndex) {
      const file = state.fileList[fileIndex];
      let ret = Promise.resolve();

      if (file.state === "ready" || file.state === "error") {
        return ret;
      }
      if (file.ext != "mhd") {
        if (file.ext === "raw") {
          if (file.extraInfo) {
            ret = readRawFile(file.files[0], file.extraInfo).then((ds) => {
              commit("setFileReader", {
                index: fileIndex,
                reader: {
                  name: file.name,
                  dataset: ds,
                },
              });
            });
          }
          commit("setFileNeedsInfo", fileIndex);
        } else if (file.ext === "dcm") {
          ret = ReaderFactory.loadFileSeries(file.files, "dcm", file.name).then(
            (r) => {
              if (r) {
                commit("setFileReader", {
                  index: fileIndex,
                  reader: r,
                });
              }
            }
          );
        } else {
          ret = ReaderFactory.loadFiles(file.files).then((r) => {
            if (r && r.length === 1) {
              commit("setFileReader", {
                index: fileIndex,
                reader: r[0],
              });
            }
          });
        }
      } else {
        commit("setFileReady", fileIndex);
      }

      return ret.catch((error) => {
        if (error) {
          console.log(error);
        }
      });
    },
    load({ rootState, state, commit, dispatch }) {
      const readyFiles = state.fileList.filter(
        (f) => f.state === "ready" && f.ext != "mhd"
      );
      let promise = Promise.resolve();
      promise = promise.then(() => {
        const regularFiles = [];
        const labelmapFiles = [];
        const measurementFiles = [];
        for (let i = 0; i < readyFiles.length; i++) {
          const file = readyFiles[i];
          const meta = (file.proxyKeys && file.proxyKeys.meta) || {};
          if (file.label) {
            labelmapFiles.push(file);
          } else if (file.name.endsWith(".measurements.json")) {
            measurementFiles.push(file);
          } else {
            regularFiles.push(file);
          }
        }
        const loadFiles = (fileList) => {
          let ret = [];
          for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i];
            const readerBundle = {
              ...f.reader,
              metadata: f.reader.metadata || {},
            };
            const meta = f.proxyKeys && f.proxyKeys.meta;

            if (meta) {
              const { reader, dataset } = readerBundle;
              const ds =
                reader && reader.getOutputData
                  ? reader.getOutputData()
                  : dataset;
              Object.assign(readerBundle, {
                dataset: postProcessDataset(ds, meta),
                reader: null,
              });
            }
            if (f.label) {
              Object.assign(readerBundle.metadata, { label: f.label });
            }
            const sources = ReaderFactory.registerReadersToProxyManager(
              [{ ...readerBundle, proxyKeys: f.proxyKeys }],
              proxyManager
            );
      
            commit("setFileProxyId", {
              index: i,
              value: sources[0].getProxyId(),
            });
            commit("setFileId", {
              proxyId: sources[0].getProxyId(),
              id: "",
              fileStatus: "uploading",
              inferObj: "器官分割",
              inferObjStatus: {
                organ: "toinfer",
                kidney: "toinfer",
                colon: "toinfer",
                liver: "toinfer",
              },
              inferStatus: false,
            });

            // dispatch("uploadFiles", {
            //   file: f,
            // });
            console.log()

            ret = ret.concat(sources.filter(Boolean));
            if (f.label) {
              ret[0].setKey("labelsourceId", f.label);
            }
          }
          return ret;
        };
        loadFiles(regularFiles);
        const loadedLabelmaps = loadFiles(labelmapFiles);

        if (loadedLabelmaps.length > 0) {
          const labelsourceId = loadedLabelmaps[0].getKey("labelsourceId");
          for (let i = 0; i < loadedLabelmaps.length; i++) {
            const lmProxy = loadedLabelmaps[i];
            const backgroundImage = proxyManager
              .getProxyById(labelsourceId)
              .getDataset();

            let lmProxy1 = proxyManager.createProxy("Sources", "LabelMap");
            const lmProxyId = lmProxy1.getProxyId();
            lmProxy1.setName(lmProxy.getName());
            dispatch(
              "widgets/addLabelmapToImage",
              {
                imageId: labelsourceId,
                labelmapId: lmProxyId,
              },
              { root: true }
            );
            const labelMap = createLabelMapFromImage(backgroundImage);
            lmProxy1.setInputData(labelMap);
            lmProxy1.setKey("inferObj", "器官");
            dispatch(
              "widgets/setLabelmapState",
              {
                labelmapId: lmProxyId,
                labelmapState: {
                  selectedLabel: 1,
                  lastColorIndex: 0,
                },
              },
              { root: true }
            );
            labelMap.setPointData(lmProxy.getDataset().getPointData());
            const cm = labelMap.getColorMap();
            const origColor = cm[1];
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            const colorArray = [r, g, b];
            labelMap.setLabelColor(1, [...colorArray, origColor[3]]);
            const color = cm[1].slice();
            color[3] = Number(255);
            labelMap.setLabelColor(1, color);
            createRepresentationInAllViews(proxyManager, lmProxy1);
            proxyManager.renderAllViews();
            proxyManager.deleteProxy(lmProxy);
          }
        }
      });

      return promise.finally(() => {
        commit("setLandStatus", true);
        commit("setOpenFileDialog", false);
        commit("setLabelUpAndDownDialog", false);
      });
    },
  },
});
