import ColorBy from "./ColorBy";
import Information from "./Information";
import Representation from "./Representation";
import Slice from "./SliceControl";

export default [
  {
    component: ColorBy,
    defaultExpand: true,
    icon: "mdi-invert-colors",
    name: "颜色预设",
    visible: (source) => source.getDataset().isA("vtkImageData"),
  },
  {
    component: Slice,
    defaultExpand: true,
    icon: "mdi-tune",
    name: "切片设置",
    visible: (source) => source.getDataset().isA("vtkImageData"),
  },
  {
    component: Representation,
    defaultExpand: true,
    icon: "mdi-brightness-6",
    name: "渲染配置",
    visible: (source) => source.getDataset().isA("vtkImageData"),
  },
  {
    component: Information,
    defaultExpand: false,
    icon: "mdi-help-circle-outline",
    name: "图像信息",
    visible: (source) => source.getDataset().isA("vtkImageData"),
  },
];
