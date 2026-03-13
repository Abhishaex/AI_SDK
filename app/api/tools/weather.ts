import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
  description:
    "Get the current weather for a location. Use this when the user asks about weather, temperature, or conditions in a city or region.",
  inputSchema: z.object({
    location: z.string().describe("The city or region to get weather for"),
    unit: z
      .enum(["celsius", "fahrenheit"])
      .optional()
      .describe("Temperature unit preference"),
  }),
  execute: async ({ location, unit = "fahrenheit" }) => {
    // Demo: return mock weather data
    const baseTemp = 72 + Math.floor(Math.random() * 21) - 10;
    const temp =
      unit === "celsius" ? Math.round(((baseTemp - 32) * 5) / 9) : baseTemp;
    const conditions = [
      "sunny",
      "partly cloudy",
      "cloudy",
      "rainy",
      "clear",
      "overcast",
    ];
    const condition =
      conditions[Math.floor(Math.random() * conditions.length)];
    return {
      location,
      temperature: temp,
      unit: unit === "celsius" ? "°C" : "°F",
      condition,
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: Math.floor(Math.random() * 15) + 5,
    };
  },
});
