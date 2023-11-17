<template>
  <v-container fluid class="container">
    <div
      class="grid"
      :style="{ gridTemplateRows, gridTemplateColumns }"
      v-if="land && !showAnalyze && !showStatistic"
    >
      <div
        class="viewContainer"
        v-for="(viewType, index) in views"
        v-bind:key="`${index}::${viewType}`"
        v-show="index < visibleCount"
      >
        <vtk-view
          v-bind:view-type="viewType"
          v-bind:layout-index="index"
          v-bind:layout-count="visibleCount"
          v-bind:background-color="backgroundColors[viewType]"
          v-on:bg-change="setViewBackground(view, arguments[0])"
        />
      </div>
    </div>
    <div
      style="
        width: 100%;
        height: 300px;
        grid-column-gap: 2px;
        grid-row-gap: 2px;
        grid-template-areas: none;
      "
      v-if="land && showAnalyze && !showStatistic"
    >
      <div
        style="
          display: flex;
          width: 100%;
          height: 100%;
          grid-column-gap: 2px;
          grid-row-gap: 2px;
          grid-template-areas: none;
        "
      >
        <div
          style="width: 25%"
          v-for="(viewType, index) in views"
          v-bind:key="`${index}::${viewType}`"
          v-show="index < 4"
        >
          <vtk-view
            v-bind:view-type="viewType"
            v-bind:layout-index="index"
            v-bind:layout-count="visibleCount"
            v-bind:background-color="backgroundColors[viewType]"
            v-on:bg-change="setViewBackground(view, arguments[0])"
          />
        </div>
      </div>
      <div style="padding: 10px">
        <v-btn
          @click="setShowAnalyze(false)"
          outlined
          style="margin-bottom: 10px"
        >
          <v-icon>mdi-keyboard-backspace</v-icon>
          返回四视图
        </v-btn>

        <v-card style="padding: 10px 20px">
          <el-table
            :data="analyzeData[analyzeTargetId]"
            border
            style="width: 100%; margin-top: 10px"
          >
            <el-table-column prop="labelName" fixed label="标签">
            </el-table-column>
            <el-table-column prop="x" label="x直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.x[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="y" label="y直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.y[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="z" label="z直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.z[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="yz" label="x面积 (mm2)"> </el-table-column>
            <el-table-column prop="xz" label="y面积 (mm2)"> </el-table-column>
            <el-table-column prop="xy" label="z面积 (mm2)"> </el-table-column>
            <el-table-column prop="volume" label="体积 (mm3)">
            </el-table-column>
          </el-table>
        </v-card>
      </div>
      <!-- <v-card style="margin: 0 10px 10px 10px">
        <div id="maychar" style="width: 100%; height: 400px"></div>
      </v-card> -->
      <v-card style="margin: 10px" class="flex" v-if="isAnalyzeFocus">
        <div
          id="focusbar"
          style="
            width: 40%;
            margin-left: 50px;
            margin-right: 20px;
            height: 400px;
          "
        ></div>
        <div
          id="focuspie"
          style="
            width: 60%;
            margin-right: 50px;
            height: 400px;
            padding-bottom: 20px;
          "
        ></div>
      </v-card>
    </div>

    <div
      style="
        width: 100%;
        height: 300px;
        grid-column-gap: 2px;
        grid-row-gap: 2px;
        grid-template-areas: none;
      "
      v-if="land && !showAnalyze && showStatistic"
    >
      <div
        style="
          display: flex;
          width: 100%;
          height: 100%;
          grid-column-gap: 2px;
          grid-row-gap: 2px;
          grid-template-areas: none;
        "
      >
        <div
          style="width: 25%"
          v-for="(viewType, index) in views"
          v-bind:key="`${index}::${viewType}`"
          v-show="index < 4"
        >
          <vtk-view
            v-bind:view-type="viewType"
            v-bind:layout-index="index"
            v-bind:layout-count="visibleCount"
            v-bind:background-color="backgroundColors[viewType]"
            v-on:bg-change="setViewBackground(view, arguments[0])"
          />
        </div>
      </div>
      <div style="padding: 10px">
        <v-btn
          @click="setShowStatistic(false)"
          outlined
          style="margin-bottom: 10px"
        >
          <v-icon>mdi-keyboard-backspace</v-icon>
          返回四视图
        </v-btn>
        <v-card style="padding: 20px">
          <el-form :model="searchform" size="default" ref="searchformRef">
            <el-row :gutter="20" class="searchbox">
              <el-col :span="6">
                <el-form-item prop="datasetName">
                  <el-select
                    v-model="searchform.datasetName"
                    placeholder="请选择数据集"
                    style="width: 100%"
                  >
                    <el-option label="未开始" value="未开始"></el-option>
                    <el-option label="报名结束" value="报名结束"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <div v-if="showSearchOption">
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      placeholder="请输入标签名称"
                      v-model="searchform.labelName"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">标签名称</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">x直径下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">x直径上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.yMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">y直径下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.yMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">y直径上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.zMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">z直径下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.zMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">z直径上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px">mm</span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.yxMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">x面积下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.yzMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">x面积上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xzMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">y面积下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xzMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">y面积上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xyMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">z面积下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.xyMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">z面积上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"
                          >mm<sup>2</sup>
                        </span></template
                      >
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.volumeMin"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">体积下限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"> cm<sup>3</sup> </span>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="inferObj">
                    <el-input
                      v-model="searchform.volumeMax"
                      :clearable="true"
                      class="input-with-select"
                    >
                      <template slot="prepend">体积上限</template>
                      <template slot="suffix">
                        <span style="line-height: 40px"> cm<sup>3</sup> </span>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </div>

              <v-btn
                @click="showSearchOption = !showSearchOption"
                style="margin-left: 10px; float: left"
                color="#E8EAF6"
              >
                <v-icon color="#303F9F">
                  {{ showSearchOption ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
                &nbsp; {{ showSearchOption ? "收起筛选" : "展开筛选" }} &nbsp;
              </v-btn>

              <v-btn
                @click="resetsearchform"
                style="float: left; margin-left: 20px"
                color="#E8EAF6"
              >
                <v-icon color="#303F9F"> mdi-refresh </v-icon>
                &nbsp; 重置 &nbsp;
              </v-btn>

              <v-btn
                @click="search"
                style="
                  float: left;
                  margin-left: 20px;
                  margin-bottom: 20px;
                  color: white;
                "
                color="#5C6BC0"
              >
                <v-icon dark> mdi-magnify </v-icon>
                &nbsp; 查询 &nbsp;
              </v-btn>

              <ExportExcel
                style="margin-left: 20px; float: left"
                ref="excelRef"
                :filename="filename"
                :tHeader="tHeader"
                @toJson="toJson"
                @getTheader="getTheader"
              ></ExportExcel>
            </el-row>
          </el-form>

          <el-table
            :data="currentStatistic"
            border
            style="width: 100%; margin-top: 10px"
          >
            <el-table-column prop="datasetName" fixed label="数据集名称">
            </el-table-column>
            <el-table-column prop="labelName" fixed label="标签名称">
            </el-table-column>
            <el-table-column prop="x" label="x直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.x[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="y" label="y直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.y[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="z" label="z直径 (mm)">
              <template slot-scope="scope">
                {{ scope.row.z[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="yz" label="x面积 (mm2)">
              <template slot-scope="scope">
                {{ scope.row.yz[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="xz" label="y面积 (mm2)">
              <template slot-scope="scope">
                {{ scope.row.xz[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="xy" label="z面积 (mm2)">
              <template slot-scope="scope">
                {{ scope.row.xy[1] }}
              </template>
            </el-table-column>
            <el-table-column prop="volume" label="体积 (mm3)">
            </el-table-column>
          </el-table>
          <div style="margin-top: 15px" class="page">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total"
              v-if="total > 0"
            >
            </el-pagination>
          </div>
        </v-card>
      </div>
      <!-- <v-card
        style="margin: 10px; padding-right: 50px; flex-direction: column"
        class="flex"
        height="900px"
        v-if="isAnalyzeFocus"
      >
        <div
          id="focusbar_statistic"
          style="width: 100%; margin: 30px; height: 400px"
        ></div>

        <div
          id="focuspie_statistic"
          style="width: 100%; margin: 30px; height: 400px; padding-bottom: 20px"
        ></div>
      </v-card> -->
    </div>

    <div
      v-if="!land"
      style="width: 100%; height: 100%; padding: 20px"
      :style="{ backgroundColor: theme === true ? '#c5cae9' : '#1A237E' }"
    >
      <dragFile enabled @drop="openFiles($event)">
        <template
          v-slot:default="{ dragHover }"
          style="width: 100%; height: 100%"
        >
          <div
            @click="promptLocal"
            class="dragfilebox flex flex-middle"
            style="flex-direction: column"
            :style="{ backgroundColor: theme === true ? 'white' : '#00002A' }"
          >
            <div>
              <v-icon
                size="100"
                style="
                  color: white;
                  background-color: #7986cb;
                  padding: 25px;
                  border-radius: 100px;
                  margin-bottom: 25px;
                "
                >mdi-file-upload-outline</v-icon
              >
            </div>
            <div style="font-size: 20px; "
            :style="{ color: theme === true ? '#606266' : 'white' }"
            
            >
              将文件拖到此处，或点击上传
            </div>
          </div>
        </template>
      </dragFile>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { Breakpoints } from "../VtkView/constants.js";
import VtkView from "../VtkView/index.vue";
import dragFile from "../Navbar/DragFile";
import ExportExcel from "../ExportExcel";
import { statisticData } from "./mock.ts";
import Mousetrap from "mousetrap";
const shortcuts = [
  { key: "r", action: "resetActiveCamera" },
  { key: ".", action: "increaseSlice" },
  { key: ",", action: "decreaseSlice" },
];
export default {
  name: "Layout",
  data() {
    return {
      url: "",
      filename: "数据集标签测量计数表",
      statisticData: statisticData,
      tHeader: [
        "数据集名称",
        "标签名称",
        "x直径",
        "y直径",
        "z直径",
        "x面积",
        "y面积",
        "z面积",
        "体积",
      ],
      filterVal: [
        "datasetName",
        "labelName",
        "x",
        "y",
        "z",
        "yz",
        "xz",
        "xy",
        "volume",
      ],
      tableData: [],
      dialog: false,
      notifications: false,
      showSearchOption: false,
      sound: true,
      currentPage: 1,
      totalPage: 0,
      pageSize: 10,
      total: 0,
      widgets: false,
      currentStatistic: [],
      searchform: {
        datasetName: "",
        labelName: "",
        xMin: "",
        yMin: "",
        zMin: "",
        yzMin: "",
        xzMin: "",
        xyMin: "",
        volumeMin: "",
        xMax: "",
        yMax: "",
        zMax: "",
        yzMax: "",
        xzMax: "",
        xyMax: "",
        volumeMax: "",
      },
    };
  },
  components: {
    VtkView,
    dragFile,
    ExportExcel,
  },
  mounted() {
    this.getCurrentPageData();
    this.total = this.statisticData.length;
    this.$store.dispatch("view/initViews");
    this.initializeAnimations();
    shortcuts.forEach(({ key, action }) =>
      Mousetrap.bind(key, (e) => {
        e.preventDefault();
        this.$store.dispatch(action);
      })
    );
  },
  proxyManagerHooks: {
    onProxyModified() {
      if (!this.land) {
        this.$proxyManager.autoAnimateViews();
      }
    },
  },
  watch: {},
  computed: {
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md;
    },
    gridTemplateRows() {
      return this.visibleCount < 4 ? "1fr" : "1fr 1fr";
    },
    gridTemplateColumns() {
      return this.visibleCount < 2 ? "1fr" : "1fr 1fr";
    },
    ...mapState("view", {
      views: (state) => state.viewOrder,
      showStatistic: (state) => state.showStatistic,
      showAnalyze: (state) => state.showAnalyze,
      analyzeTargetId: (state) => state.analyzeTargetId,
      backgroundColors: (state) => state.backgroundColors,
      visibleCount(state) {
        return this.smallScreen ? 1 : state.visibleCount;
      },
      viewTypes: (state) => state.viewTypes,
      barOption: (state) => state.barOption,
      analyzeData: (state) => state.analyzeData,
      isAnalyzeFocus: (state) => state.isAnalyzeFocus,
    }),
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
  methods: {
    resetsearchform() {
      this.$refs.searchformRef.resetFields();
      this.searchform = {
        datasetName: "",
        labelName: "",
        xMin: "",
        yMin: "",
        zMin: "",
        yzMin: "",
        xzMin: "",
        xyMin: "",
        volumeMin: "",
        xMax: "",
        yMax: "",
        zMax: "",
        yzMax: "",
        xzMax: "",
        xyMax: "",
        volumeMax: "",
      };
      this.statisticData = statisticData;
      this.total = statisticData.length;
      this.getCurrentPageData();
    },
    toJson(callback) {
      callback(
        this.$refs["excelRef"].formatJson(this.filterVal, this.statisticData)
      );
    },
    getTheader(callback) {
      callback(this.tHeader);
    },
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.getCurrentPageData();
    },
    getCurrentPageData() {
      let begin = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      this.currentStatistic = this.statisticData.slice(begin, end);
    },
    search() {
      if (
        this.searchform.datasetName === "" &&
        this.searchform.labelName === "" &&
        this.searchform.xMin === "" &&
        this.searchform.yMin === "" &&
        this.searchform.zMin === "" &&
        this.searchform.yzMin === "" &&
        this.searchform.xzMin === "" &&
        this.searchform.xyMin === "" &&
        this.searchform.volumeMin === "" &&
        this.searchform.xMax === "" &&
        this.searchform.yMax === "" &&
        this.searchform.zMax === "" &&
        this.searchform.yzMax === "" &&
        this.searchform.xzMax === "" &&
        this.searchform.xyMax === "" &&
        this.searchform.volumeMax === ""
      ) {
        this.$message.info("请输入查询条件");
        this.statisticData = statisticData;
        this.getCurrentPageData();
      } else {
        let datasetName = this.searchform.datasetName;
        let labelName = this.searchform.labelName;
        let xMin = parseInt(this.searchform.xMin) || -Infinity;
        let yMin = parseInt(this.searchform.yMin) || -Infinity;
        let zMin = parseInt(this.searchform.zMin) || -Infinity;
        let yzMin = parseInt(this.searchform.yzMin) || -Infinity;
        let xzMin = parseInt(this.searchform.xzMin) || -Infinity;
        let xyMin = parseInt(this.searchform.xyMin) || -Infinity;
        let volumeMin = parseInt(this.searchform.volumeMin) || -Infinity;
        let xMax = parseInt(this.searchform.xMax) || Infinity;
        let yMax = parseInt(this.searchform.yMax) || Infinity;
        let zMax = parseInt(this.searchform.zMax) || Infinity;
        let yzMax = parseInt(this.searchform.yzMax) || Infinity;
        let xzMax = parseInt(this.searchform.xzMax) || Infinity;
        let xyMax = parseInt(this.searchform.xyMax) || Infinity;
        let volumeMax = parseInt(this.searchform.volumeMax) || Infinity;

        let res = statisticData;
        if (datasetName != "")
          res = res.filter((r) => {
            return r.datasetName == datasetName;
          });
        if (labelName != "")
          res = res.filter((r) => {
            return r.labelName == labelName;
          });
        res = res.filter((r) => {
          return (
            r.x[1] > xMin &&
            r.x[1] < xMax &&
            r.y[1] > yMin &&
            r.y[1] < yMax &&
            r.z[1] > zMin &&
            r.z[1] < zMax &&
            r.yz[1] > yzMin &&
            r.yz[1] < yzMax &&
            r.xz[1] > xzMin &&
            r.xz[1] < xzMax &&
            r.xy[1] > xyMin &&
            r.xy[1] < xyMax &&
            r.volume > volumeMin &&
            r.volume < volumeMax
          );
        });
        this.total = res.length;
        this.currentPage = 1;
        this.statisticData = res;
        this.getCurrentPageData();
      }
    },
    showCharBox() {
      const chartBox = this.$echarts.init(document.getElementById("maychar"));
      chartBox.setOption(this.barOption);
      chartBox.resize();
      window.addEventListener("resize", function () {
        chartBox.resize();
      });
    },
    testcapture() {
      const view = this.$proxyManager.getActiveView();
      if (view) {
        return view.captureImage().then((imgSrc) => {
          this.url = imgSrc;
        });
      }
      return Promise.resolve();
    },
    setShowAnalyze(val) {
      this.setShowAnalyze(val);
    },
    ...mapActions("files", ["openFiles", "promptLocal"]),
    ...mapActions("view", ["setShowAnalyze", "setShowStatistic"]),
    ...mapActions("animations", ["initializeAnimations"]),
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  padding: 0;
}

.grid {
  height: 100%;
  display: grid;
  grid-column-gap: 2px;
  grid-row-gap: 2px;
  grid-template-areas: none;
}

.viewContainer {
  min-height: 0;
  min-width: 0;
}
.dragfilebox {
  border: 1px dashed #d9d9d9;
  width: 100%;
  height: 100%;
}
.dragfilebox :hover {
  cursor: pointer;
  // background: #e8eaf6;
}
</style>