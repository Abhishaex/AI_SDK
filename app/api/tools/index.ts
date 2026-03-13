import { weatherTool } from "./weather";
import { calculatorTool } from "./calculator";
import { datetimeTool } from "./datetime";

export const chatTools = {
  weather: weatherTool,
  calculator: calculatorTool,
  getCurrentDateTime: datetimeTool,
};

export { weatherTool } from "./weather";
export { calculatorTool } from "./calculator";
export { datetimeTool } from "./datetime";
