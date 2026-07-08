import type { LoggerService } from "@nestjs/common";

type LogLevel = "debug" | "error" | "log" | "verbose" | "warn";

export class StructuredLogger implements LoggerService {
  debug(message: unknown, context?: string) {
    this.write("debug", message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write("error", message, context, { trace });
  }

  log(message: unknown, context?: string) {
    this.write("log", message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write("verbose", message, context);
  }

  warn(message: unknown, context?: string) {
    this.write("warn", message, context);
  }

  private write(level: LogLevel, message: unknown, context?: string, extra?: Record<string, unknown>) {
    const payload = {
      context,
      level,
      message: this.normalizeMessage(message),
      service: "style-companion-api",
      timestamp: new Date().toISOString(),
      ...extra
    };

    const line = JSON.stringify(payload);

    if (level === "error") {
      console.error(line);
      return;
    }

    if (level === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  private normalizeMessage(message: unknown) {
    if (message instanceof Error) {
      return {
        message: message.message,
        name: message.name
      };
    }

    return message;
  }
}
