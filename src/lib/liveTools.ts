import { Type } from "@google/genai";

export const LIVE_FUNCTION_DECLARATIONS = [
  {
    name: "get_current_time",
    description: "Gets the current date and time for the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        timeZone: {
          type: Type.STRING,
          description: "Optional IANA timezone, for example America/New_York.",
        },
      },
      required: [],
    },
  },
  {
    name: "calculate",
    description: "Performs a basic math calculation.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        expression: {
          type: Type.STRING,
          description: "A simple math expression, for example '25 * 4 + 10'.",
        },
      },
      required: ["expression"],
    },
  },
] as const;

export const LIVE_FUNCTION_HANDLERS: Record<
  string,
  (args: any) => Promise<any> | any
> = {
  get_current_time: ({ timeZone }) => {
    const now = new Date();

    return {
      iso: now.toISOString(),
      local: timeZone
        ? now.toLocaleString("en-US", { timeZone })
        : now.toLocaleString(),
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  },

  calculate: ({ expression }) => {
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error("Invalid math expression");
    }

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression});`)();

    return {
      expression,
      result,
    };
  },
};