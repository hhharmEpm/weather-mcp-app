import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import type { Request, Response } from "express";
import pino from "pino";
import { createServer } from "./server.js";
import { AppError } from "./src/errors/index.js";

const isProduction = process.env.NODE_ENV === "production";

const logger = isProduction
  ? pino({ level: "info" })
  : pino({ level: "debug", transport: { target: "pino-pretty" } });

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

export async function startStreamableHTTPServer(
  createServerFn: () => McpServer,
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);

  const app = createMcpExpressApp({ host: "0.0.0.0" });

  app.use(express.json({ limit: "10kb" }));

  const helmetConfig = isProduction
    ? {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      }
    : {};

  app.use(helmet(helmetConfig));

  const allowedOrigins = isProduction
    ? process.env.ALLOWED_ORIGINS?.split(",") ?? false
    : DEV_ORIGINS;

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    })
  );

  app.use((_req: Request, _res: Response, next: () => void) => {
    logger.info({ method: _req.method, path: _req.path }, "Incoming request");
    next();
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createServerFn();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error({ error }, "MCP error");
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.delete("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.use((err: Error, _req: Request, res: Response, _next: () => void) => {
    logger.error({ err, message: err.message }, "Request error");

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        jsonrpc: "2.0",
        error: { code: err.code, message: err.message },
        id: null,
      });
      return;
    }

    res.status(500).json({
      jsonrpc: "2.0",
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
      id: null,
    });
  });

  const httpServer = app.listen(port, (err) => {
    if (err) {
      logger.fatal({ err }, "Failed to start server");
      process.exit(1);
    }
    logger.info({ port }, "MCP server listening");
  });

  const shutdown = () => {
    logger.info("Shutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export async function startStdioServer(
  createServerFn: () => McpServer,
): Promise<void> {
  const server = createServerFn();
  await server.connect(new StdioServerTransport());

  const shutdown = async () => {
    logger.info("Shutting down stdio server...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((e) => {
  logger.fatal({ e }, "Fatal error");
  process.exit(1);
});
