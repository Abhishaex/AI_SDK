import { tool } from "ai";
import { z } from "zod";

export const datetimeTool = tool({
  description:
    "Get the current date and time. Use when the user asks what day it is, current time, date, or today's date.",
  inputSchema: z.object({
    timezone: z
      .string()
      .optional()
      .describe("Timezone (e.g. America/New_York, Europe/London). Defaults to UTC."),
  }),
  execute: async ({ timezone = "UTC" }) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long",
    });
    const formatted = formatter.format(now);
    return {
      datetime: formatted,
      timezone,
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
    };
  },
});
