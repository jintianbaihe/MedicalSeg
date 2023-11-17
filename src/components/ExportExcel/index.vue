<template>
  <div>
    <el-button
    class="
    v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default"
    style="color: white;line-height: 36px;"
      :loading="downloadLoading"
      type="primary"
      @click="handleDownload"
    >
      <v-icon v-if="!downloadLoading" style="margin-bottom: 5px;" dark> mdi-file-document-outline </v-icon>
      &nbsp; 下载报表&nbsp;
    </el-button>
  </div>
</template>
  
<script>
export default {
  name: "ExportExcel",
  props: ["filename", "tHeader"],
  data() {
    return {
      listLoading: true,
      downloadLoading: false,
      autoWidth: true,
    };
  },

  methods: {
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        var _data = [];
        this.$emit("toJson", (list) => {
          _data = list;
        });
        if (_data != []) {
          var theader;
          this.$emit("getTheader", (tHeader) => {
            theader = tHeader;
          });
          excel.export_json_to_excel({
            header: theader,
            data: _data,
            bookType: "xlsx",
            filename: this.filename,
            autoWidth: this.autoWidth,
          });
          this.downloadLoading = false;
        }
      });
    },
    formatJson(filterVal, jsonData) {
      console.log(jsonData);
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
  },
};
</script>
  
  <style>
.radio-label {
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 30px;
}
</style>