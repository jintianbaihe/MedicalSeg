import * as echarts from "echarts/core";
 
import { BarChart,ScatterChart } from "echarts/charts";
 
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  BrushComponent,
  ToolboxComponent
} from "echarts/components";
 
import { LabelLayout, UniversalTransition } from "echarts/features";
 
import { CanvasRenderer } from "echarts/renderers";
 
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  BarChart,
  ScatterChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent

]);
 
export default echarts;