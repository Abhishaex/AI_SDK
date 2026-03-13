import { tool } from "ai";
import { z } from "zod";
import { weatherTool } from "../../tools/weather";
import { calculatorTool } from "../../tools/calculator";
import { datetimeTool } from "../../tools/datetime";

// Additional tools for multiple-tools demo
export const randomNumberTool = tool({
  description:
    "Generate a random number within a range. Use when the user asks for a random number, dice roll, or lottery pick.",
  inputSchema: z.object({
    min: z.number().describe("Minimum value (inclusive)"),
    max: z.number().describe("Maximum value (inclusive)"),
  }),
  execute: async ({ min, max }) => {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    return { value, min, max, message: `Random number between ${min} and ${max}: ${value}` };
  },
});

export const jokeTool = tool({
  description:
    "Get a random joke. Use when the user asks for a joke, wants to laugh, or needs entertainment.",
  inputSchema: z.object({
    category: z
      .enum(["general", "programming", "dad"])
      .optional()
      .describe("Joke category. Defaults to general."),
  }),
  execute: async ({ category = "general" }) => {
    const jokes: Record<string, string[]> = {
      general: [
        "Why don't scientists trust atoms? Because they make up everything!",
        "What do you call a fake noodle? An impasta!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
      ],
      programming: [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
        "How many programmers does it take to change a light bulb? None, it's a hardware problem.",
      ],
      dad: [
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "What do you call a bear with no teeth? A gummy bear!",
      ],
    };
    const list = jokes[category] ?? jokes.general;
    const joke = list[Math.floor(Math.random() * list.length)];
    return { joke, category };
  },
});

export const multipleTools = {
  weather: weatherTool,
  calculator: calculatorTool,
  getCurrentDateTime: datetimeTool,
  randomNumber: randomNumberTool,
  joke: jokeTool,
};
