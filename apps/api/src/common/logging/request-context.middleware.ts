import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { StructuredLogger } from "./structured-logger";

export type RequestWithId = Request & {
  requestId?: string;
};

const logger = new StructuredLogger();

export function requestContextMiddleware(req: RequestWithId, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") ?? randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    logger.log(
      {
        durationMs: Date.now() - startedAt,
        method: req.method,
        path: req.originalUrl,
        requestId,
        statusCode: res.statusCode
      },
      "HttpRequest"
    );
  });

  next();
}
