import { ColorPicker } from "element-ui";
import { Table } from "element-ui";
import { TableColumn } from "element-ui";
import { Pagination } from "element-ui";
import { Form } from "element-ui";
import { FormItem } from "element-ui";
import { Row } from "element-ui";
import { Input } from "element-ui";
import { Col } from "element-ui";
import { Button } from "element-ui";
import { Select } from "element-ui";
import { Option } from "element-ui";
import { Message } from "element-ui";

const elementui = {
  install: function (Vue) {
    Vue.use(ColorPicker);
    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Row);
    Vue.use(Input);
    Vue.use(Col);
    Vue.use(Button);
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(Message);
    Vue.use(Pagination);
    Vue.prototype.$message = Message;

  },
};
export default elementui;
