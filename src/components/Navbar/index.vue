<template>
  <div
    style="text-align: right; display: flex; margin-right: 20px; flex: 1"
    class="flex-middle"
  >
    <v-spacer></v-spacer>
    <v-btn v-if="land" color="#5C6BC0" @click.prevent.stop="openTutorial()">
      <v-icon dark left> mdi-help-circle-outline </v-icon>使用教程
    </v-btn>
    <v-btn
      style="margin-left: 20px"
      color="#5C6BC0"
      id="first-element-introduction"
      @click="setFileDialog(true)"
    >
      <v-icon dark left> mdi-upload </v-icon>上传文件
    </v-btn>
    <v-btn
      id="second-element-introduction"
      color="#5C6BC0"
      style="margin-left: 20px"
      @click="setDcmFileDialog(true)"
    >
      <v-icon left> mdi-upload-multiple </v-icon>
      上传dicom序列</v-btn
    >
    <div class="switchbox " style="margin-left: 20px;">
      <v-switch v-model="switchTheme" inset>
        <template v-slot:label>
          <v-icon>mdi-theme-light-dark</v-icon>
      </template>
      </v-switch>
    </div>
    <v-dialog v-model="showOpenFileDialog" width="52%">
      <v-card>
        <v-card-text class="pa-0">
          <v-card flat>
            <v-card-text>
              <div class="flex">
                <dragFile enabled @drop="openFiles($event)">
                  <template v-slot:default="{ dragHover }">
                    <v-row @click="promptLocal" align="center" class="pa-3">
                      <v-btn color="indigo lighten-2" dark>
                        <v-icon left> mdi-plus </v-icon>
                        添加文件</v-btn
                      >
                    </v-row>
                  </template>
                </dragFile>
              </div>
              <v-container>
                <v-row class="mt-2">
                  <v-expansion-panels accordion>
                    <v-expansion-panel
                      v-for="(fileInfo, revIdx) in fileList"
                      :key="revIdx"
                    >
                      <v-expansion-panel-header disable-icon-rotate>
                        <template v-slot:actions>
                          <div class="d-flex flex-row align-center">
                            <template v-if="fileInfo.state === 'ready'">
                              <v-icon color="teal">mdi-check</v-icon>
                            </template>

                            <template v-else-if="fileInfo.state === 'error'">
                              <v-icon color="error">mdi-alert</v-icon>
                            </template>
                            <template
                              v-else-if="fileInfo.state === 'needsInfo'"
                            >
                              <v-icon color="blue">mdi-information</v-icon>
                              <v-tooltip bottom>
                                <span class="pv-no-select">粘贴数据规格</span>
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    icon
                                    class="ml-3"
                                    v-on="on"
                                    @click="pastedataspec(revIdx)"
                                  >
                                    <v-icon color="indigo"
                                      >mdi-content-paste</v-icon
                                    >
                                  </v-btn>
                                </template>
                              </v-tooltip>
                            </template>
                            <template
                              v-else-if="
                                fileInfo.state === 'loading' ||
                                fileInfo.state === 'needsDownload'
                              "
                            >
                              <v-progress-circular
                                indeterminate
                                color="secondary"
                                size="16"
                                width="2"
                              />
                            </template>
                            <v-tooltip bottom>
                              <span class="pv-no-select">复制数据规格</span>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  icon
                                  class="ml-3"
                                  v-if="
                                    fileInfo.state === 'ready' &&
                                    fileInfo.ext === 'mhd'
                                  "
                                  v-on="on"
                                  @click="copydataspec(fileInfo)"
                                >
                                  <v-icon color="indigo"
                                    >mdi-content-copy</v-icon
                                  >
                                </v-btn>
                              </template>
                            </v-tooltip>

                            <v-btn icon class="ml-3">
                              <v-icon @click.stop="deleteFileAtRevIndex(revIdx)"
                                >mdi-delete</v-icon
                              >
                            </v-btn>
                          </div>
                        </template>
                        <template v-slot:default="{ open }">
                          <v-row no-gutters style="width: 80%">
                            <v-col cols="8">{{ fileInfo.name }}</v-col>
                            <v-col
                              cols="4"
                              class="text--secondary pr-3 text-right"
                            >
                              <span v-if="fileInfo.ext === 'raw'">
                                点击编辑文件数据规格
                              </span>
                            </v-col>
                          </v-row>
                        </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content
                        style="padding: 0 24px 16px !important"
                      >
                        <template v-if="fileInfo.state === 'error'">
                          {{ fileInfo.error }}
                        </template>
                        <template v-else-if="fileInfo.ext === 'raw'">
                          <RawFileReader
                            :file="fileInfo.files[0]"
                            :ref="`rawreader${revIdx}`"
                            v-on:change="
                              setRawFileInfoAtRevIndex(revIdx, $event)
                            "
                          />
                        </template>
                        <template v-else-if="fileInfo.ext === 'mhd'">
                          <v-card flat>
                            <v-container grid-list-xs class="pa-0">
                              <v-layout row align-center>
                                <v-flex xs3 class="body-2">数据类型:</v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.dataType }}
                                </v-flex>
                              </v-layout>
                              <v-layout row align-center>
                                <v-flex xs3 class="body-2">维数:</v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.dimension[0] }}
                                </v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.dimension[1] }}
                                </v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.dimension[2] }}
                                </v-flex>
                              </v-layout>
                              <v-layout row align-center>
                                <v-flex xs3 class="body-2">体素:</v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.spacing[0] }}
                                </v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.spacing[1] }}
                                </v-flex>
                                <v-flex xs3 class="body-1">
                                  {{ fileInfo.spacing[2] }}
                                </v-flex>
                              </v-layout>
                            </v-container>
                          </v-card>
                        </template>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-row>
              </v-container>
            </v-card-text>
            <v-btn
              style="width: 50%; border-radius: 0"
              :disabled="loading"
              @click="setFileDialog(false)"
              >取消</v-btn
            >
            <v-btn
              color="indigo lighten-1"
              :disabled="loading || pendingFiles || !hasReadyFiles"
              style="width: 50%; border-radius: 0; color: white"
              @click.native="handleFile"
              >{{ loading ? "加载中..." : "上传文件" }}</v-btn
            >
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showOpenDcmFileDialog" width="52%">
      <v-card>
        <v-card flat>
          <v-card-text>
            <v-container>
              <v-row class="mt-2">
                <v-file-input
                  show-size
                  ref="fileInput"
                  multiple
                  v-model="files"
                  color="deep-purple accent-4"
                  counter
                  label="DICOM序列"
                  placeholder="点击上传dicom序列文件"
                  prepend-icon=""
                  outlined
                >
                  <template v-slot:selection="{ text, index }">
                    <v-chip
                      small
                      dark
                      label
                      v-if="index < 15"
                      color="indigo accent-3"
                      close
                      @click:close="removeFile(index)"
                    >
                      {{ text }}
                    </v-chip>
                    <span
                      v-else-if="index === 15"
                      class="text-overline grey--text text--darken-3 mx-2"
                    >
                      +{{ files.length - 15 }} File(s)
                    </span>
                  </template>
                </v-file-input>
              </v-row>
            </v-container>
          </v-card-text>
          <v-btn
            style="width: 50%; border-radius: 0"
            :disabled="loadingDcm"
            @click="setDcmFileDialog(false)"
            >取消</v-btn
          >
          <v-btn
            color="indigo lighten-1"
            style="width: 50%; border-radius: 0; color: white"
            @click.native="handleDcmFile"
          >
            <v-icon v-if="loadingDcm">mdi-progress-upload</v-icon>
            {{ loadingDcm ? "加载中..." : "上传文件" }}</v-btn
          >
        </v-card>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import dragFile from "./DragFile";
import RawFileReader from "./RawFileReader";
import Driver from "driver.js";
import "driver.js/dist/driver.min.css";

export default {
  name: "Navbar",
  data() {
    return {
      files: [],
      loading: false,
      switchTheme: true,
      loadingDcm: false,
      showOpenDcmFileDialog: false,
      copyboard: {
        dataType: "Integer 8",
        dimensions: [512, 512, 1],
        spacing: [1, 1, 1],
      },
    };
  },
  computed: {
    showOpenFileDialog: {
      get() {
        return this.$store.state.files.showOpenFileDialog;
      },
      set(val) {
        this.setFileDialog(val);
      },
    },
    ifHasMhd() {
      let mhdlen = this.fileList.filter((f) => f.ext === "mhd");
      return mhdlen.length != 0;
    },
    ...mapState("view", {
      activeTab(state) {
        return state.activeTab;
      },
    }),
    ...mapState("files", {
      land(state) {
        return state.land;
      },
      fileList: (state) => Array.from(state.fileList).reverse(),
      pendingFiles: (state) =>
        state.fileList.reduce(
          (flag, file) =>
            flag || (file.state !== "ready" && file.state !== "error"),
          false
        ),
      hasReadyFiles: (state) =>
        state.fileList.reduce(
          (flag, file) => flag || file.state === "ready",
          false
        ),
    }),
  },
  watch: {
    switchTheme(val){
      this.setTheme(val)
    }
  },
  mounted() {},
  components: {
    dragFile,
    RawFileReader,
  },
  methods: {
    openTutorial() {
      const driver = new Driver({
        animate: false, // 在更改突出显示的元素时设置动画
        allowClose: false, // 禁止点击外部关闭
        stageBackground: "#fff", // 引导对话的背景色
        closeBtnText: "关闭", // 关闭文本
        overlayClickNext: false, // 蒙层点击是否执行下一步
        prevBtnText: "上一步", // 上一步文本
        nextBtnText: "下一步", // 下一步按钮标题
        keyboardControl: true,
        doneBtnText: "确定", // 最后一步完成按钮展示文本
      });
      driver.defineSteps([
        {
          element: "#first-element-introduction",
          popover: {
            className: "first-step-popover-class",
            title: "Tip 1 上传文件",
            description: "支持多种格式，上传后的文件显示在左侧数据集列表中",
            position: "bottom",
          },
          onNext: () => {
            this.setActiveTab(0);
            console.log(this.activeTab);
          },
        },
        {
          element: "#second-element-introduction",
          popover: {
            title: "Tip 2 上传DICOM序列",
            description: "支持上传DICOM序列文件，生成dcm格式",
            position: "left",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#third-element-introduction",
          popover: {
            title: "Tip 3 数据集列表",
            description:
              "若上传多个数据集文件，点击需要显示的数据集前面的单选按钮进行激活，之后的标注、分析等操作都将针对激活的数据集进行",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#forth-element-introduction",
          popover: {
            title: "Tip 4 推理",
            description:
              "选择分割对象（支持十五器官、肾癌、肠癌、肝癌病灶推理），当文件上传成功后，按钮状态由上传中变为推理，点击推理，等待2～3分钟即可",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#fifth-element-introduction",
          popover: {
            title: "Tip 5 标签列表",
            description:
              "推理出的标签以及用户自定义的标签集将显示在该列表下，支持标签显示隐藏",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#sixth-element-introduction",
          popover: {
            title: "Tip 6 标签导入导出",
            description:
              "支持导入文件作为标签显示；支持导出单个或多个与原图像格式一致的标签",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#seventh-element-introduction",
          popover: {
            title: "Tip 7 颜色映射",
            description:
              "用户可针对三维图像选择适合的颜色映射方案，支持调整透明度、切片同步着色",
            position: "right",
          },
          onNext: () => {
            this.setActiveTab(1);
          },
          onPrevious: () => {},
        },
        {
          element: "#eighth-element-introduction",
          popover: {
            title: "Tip 8 悬浮工具组",
            description:
              "工具分别为图像快照、重置摄像机、向左旋转90度、向右旋转90度、切换至矢状面、冠状面、横截面，二维视图悬浮工具组中第三个工具为播放切片动画",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#ninth-element-introduction",
          popover: {
            title: "Tip 9 图像基本操作",
            description:
              "此处说明了各种键盘鼠标交互事件，包括缩放、切换切片、旋转、拖动、调整窗宽窗位",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {
            this.setActiveTab(0);
          },
        },
        {
          element: "#tenth-element-introduction",
          popover: {
            title: "Tip 10 画笔模式",
            description:
              "当用户需要使用画笔工具时，首先要选择一个标签集，再打开画笔模式，选择一个画笔工具进行标注；此处的标签集对应数据集列表下的标签列表，支持标签集添加、删除、修改名称",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#eleventh-element-introduction",
          popover: {
            title: "Tip 11 画笔工具",
            description:
              "支持3d笔刷、2d笔刷、曲线标注、多边形标注、橡皮擦、提取最大连通域进行标注优化",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#twelveth-element-introduction",
          popover: {
            title: "Tip 12 标签管理",
            description:
              "选择一个标签集后，可以对标签进行颜色切换、添加、删除标签，这里的标签相当于图层",
            position: "right",
          },
          onNext: () => {
            this.setActiveTab(2);
          },
          onPrevious: () => {},
        },
        {
          element: "#thirteenth-element-introduction",
          popover: {
            title: "Tip 13 背景设置",
            description:
              "点击可以设置视图的背景颜色，也可以在左侧工具组的背景设置中进行统一配置",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
        {
          element: "#fourteenth-element-introduction",
          popover: {
            title: "Tip 14 数据分析",
            description:
              "点击分析按钮可以获取数据集标签的直径、面积、体积、器官数量、病灶数量等信息，以图表形式进行展示；点击统计结果分析将对上传的所有数据集进行分析展示",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {
            this.setActiveTab(1);
          },
        },
        {
          element: "#fifteenth-element-introduction",
          popover: {
            title: "Tip 15 后处理脚本",
            description:
              "此处表格说明了后处理脚本支持函数的函数名、输入参数以及返回结果，用户在下方输入框中输入相应代码（支持代码提示），点击运行脚本按钮，结果将显示在下方",
            position: "right",
          },
          onNext: () => {},
          onPrevious: () => {},
        },
      ]);
      // 开始分步引导介绍
      driver.start();
    },
    copydataspec(fileInfo) {
      this.copyboard.dataType = fileInfo.dataType;
      this.copyboard.dimensions = fileInfo.dimension;
      this.copyboard.spacing = fileInfo.spacing;
    },
    uploadDicom() {},
    removeFile(index) {
      this.files.splice(index, 1);
    },
    pastedataspec(revIdx) {
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs[`rawreader${revIdx}`][0].pastespec(
            this.copyboard.dataType,
            this.copyboard.dimensions,
            this.copyboard.spacing
          );
        });
      }, 1000);
    },
    setDcmFileDialog(value) {
      this.showOpenDcmFileDialog = value;
    },
    deleteFileAtRevIndex(revIdx) {
      return this.deleteFile(this.fileList.length - 1 - revIdx);
    },
    setRawFileInfoAtRevIndex(revIdx, info) {
      return this.setRawFileInfo({
        index: this.fileList.length - 1 - revIdx,
        info,
      });
    },
    handleFile() {
      this.loading = true;
      this.load().finally(() => {
        setTimeout(() => this.resetQueue(), 10);
        setTimeout(() => {
          this.loading = false;
        }, 10);
      });
    },
    handleDcmFile() {
      this.loadingDcm = true;
      this.openDcmFiles(this.files).finally(() => {
        this.load();
        setTimeout(() => {
          this.resetQueue();
          this.files = [];
        }, 10);
        setTimeout(() => {
          this.loadingDcm = false;
          this.showOpenDcmFileDialog = false;
        }, 10);
      });
    },
    setFileDialog(value) {
      this.setOpenFileDialog(value);
      if (!value) setTimeout(() => this.resetQueue(), 10);
    },
    ...mapActions(["setTheme"]),
    ...mapActions("view", ["setActiveTab"]),
    ...mapActions("files", [
      "load",
      "handleFiles",
      "openFiles",
      "promptLocal",
      "setRawFileInfo",
      "setOpenFileDialog",
      "deleteFile",
      "resetQueue",
      "openDcmFiles",
    ]),
  },
};
</script>
