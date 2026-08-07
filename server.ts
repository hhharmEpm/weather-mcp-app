import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { handleGetWeather } from "./src/handlers/weather-handler.js";
import {
  getWeatherInputSchema,
  weatherToolOutputSchema,
} from "./src/types/weather.js";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

export type {
  WeatherData,
  GeocodingResult,
  GetWeatherInput,
} from "./src/types/weather.js";
export {
  geocodingResponseSchema,
  openMeteoResponseSchema,
  airQualityResponseSchema,
} from "./src/types/weather.js";
export {
  getWeatherInputSchema,
  weatherToolOutputSchema,
} from "./src/types/weather.js";
export {
  formatWeatherText,
  getWindDirection,
  getAQILevel,
} from "./src/services/weather-formatter.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Weather MCP App",
    version: "1.0.0",
  });

  const resourceUri = "ui://weather/mcp-app.html";

  registerAppTool(
    server,
    "get_weather",
    {
      title: "Get Weather",
      description:
        "Get current weather, hourly forecast, 7-day forecast, and air quality for a city name or zip code.",
      inputSchema: getWeatherInputSchema.shape,
      outputSchema: weatherToolOutputSchema.shape,
      _meta: { ui: { resourceUri } },
    },
    handleGetWeather,
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  return server;
}
