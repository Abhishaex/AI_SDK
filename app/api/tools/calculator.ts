import { tool } from "ai";
import { z } from "zod";

export const calculatorTool = tool({
  description:
    "Perform basic math operations: add, subtract, multiply, divide. Use when the user asks for calculations or arithmetic.",
  inputSchema: z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("The math operation to perform"),
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  execute: async ({ operation, a, b }) => {
    switch (operation) {
      case "add":
        return { result: a + b, operation: "add", expression: `${a} + ${b}` };
      case "subtract":
        return {
          result: a - b,
          operation: "subtract",
          expression: `${a} - ${b}`,
        };
      case "multiply":
        return {
          result: a * b,
          operation: "multiply",
          expression: `${a} × ${b}`,
        };
      case "divide":
        if (b === 0) throw new Error("Cannot divide by zero");
        return {
          result: a / b,
          operation: "divide",
          expression: `${a} ÷ ${b}`,
        };
      default:
        return { error: "Unknown operation" };
    }
  },
});
