import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

import type { RequestWithId } from "../logging/request-context.middleware";
import { StructuredLogger } from "../logging/structured-logger";

type HttpExceptionResponse = {
  error?: string;
  message?: string | string[];
  statusCode?: number;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger = new StructuredLogger()) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<Response>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = this.getDetails(exception);
    const message = this.getMessage(exception, statusCode);
    const code = this.getCode(exception, statusCode);

    this.logger.error(
      {
        code,
        details,
        method: request.method,
        path: request.originalUrl,
        requestId: request.requestId,
        statusCode
      },
      exception instanceof Error ? exception.stack : undefined,
      "HttpException"
    );

    response.status(statusCode).json({
      error: {
        code,
        details,
        message,
        method: request.method,
        path: request.originalUrl,
        requestId: request.requestId,
        statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }

  private getCode(exception: unknown, statusCode: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "object" && response !== null && "error" in response) {
        return String((response as HttpExceptionResponse).error).toUpperCase().replaceAll(" ", "_");
      }
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return "INTERNAL_SERVER_ERROR";
    }

    return `HTTP_${statusCode}`;
  }

  private getDetails(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      return undefined;
    }

    const response = exception.getResponse();

    if (typeof response === "object" && response !== null && "message" in response) {
      const message = (response as HttpExceptionResponse).message;
      return Array.isArray(message) ? message : undefined;
    }

    return undefined;
  }

  private getMessage(exception: unknown, statusCode: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "string") {
        return response;
      }

      if (typeof response === "object" && response !== null && "message" in response) {
        const message = (response as HttpExceptionResponse).message;
        return Array.isArray(message) ? "Validation failed." : message;
      }

      return exception.message;
    }

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return "An unexpected error occurred.";
    }

    return "Request failed.";
  }
}
