import { Injectable, Logger } from '@nestjs/common';
import { LogContext } from './enum/log-context.enum';
import { LogAction } from './enum/log-action.enum';
import { LogStatus } from './enum/log-status.type';

@Injectable()
export class LogHandlerService extends Logger {
  // toggle structured JSON output
  private structured = true;

  private buildPayload(
    level: 'error' | 'warn' | 'info' | 'debug',
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    status?: LogStatus,
    message?: string,
    meta?: Record<string, any>,
  ) {
    const base = {
      timestamp: new Date().toISOString(),
      level,
      context,
      identifier: identifier ?? null,
      action: action ?? null,
      status: status ?? null,
      message: message ?? null,
      meta: meta ?? null,
    };
    return base;
  }

  private output(
    level: 'error' | 'warn' | 'info' | 'debug',
    payload: any,
    trace?: string,
  ) {
    if (this.structured) {
      const json = JSON.stringify(payload);
      switch (level) {
        case 'error':
          super.error(json, trace);
          break;
        case 'warn':
          super.warn(json);
          break;
        case 'debug':
          super.debug(json);
          break;
        default:
          super.log(json);
          break;
      }
    } else {
      // human friendly fallback
      const parts = [
        payload.status,
        payload.identifier,
        payload.context,
        payload.action,
      ]
        .filter(Boolean)
        .join(':::');
      const text = `${parts}${payload.message ? `:::${payload.message}` : ''}`;
      switch (level) {
        case 'error':
          super.error(text, trace);
          break;
        case 'warn':
          super.warn(text);
          break;
        case 'debug':
          super.debug(text);
          break;
        default:
          super.log(text);
          break;
      }
    }
  }

  // Generic logger method
  logWithStatus(
    level: 'error' | 'warn' | 'info' | 'debug',
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    status?: LogStatus,
    message?: string,
    meta?: Record<string, any>,
    trace?: string,
  ) {
    const payload = this.buildPayload(
      level,
      context,
      identifier,
      action,
      status,
      message,
      meta,
    );
    this.output(level, payload, trace);
  }

  // Convenience wrappers
  success(
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    message?: string,
    meta?: Record<string, any>,
  ) {
    this.logWithStatus(
      'info',
      context,
      identifier,
      action,
      'success',
      message,
      meta,
    );
  }

  info(
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    message?: string,
    meta?: Record<string, any>,
  ) {
    this.logWithStatus(
      'info',
      context,
      identifier,
      action,
      'info',
      message,
      meta,
    );
  }

  warn(
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    message?: string,
    meta?: Record<string, any>,
  ) {
    this.logWithStatus(
      'warn',
      context,
      identifier,
      action,
      'warn',
      message,
      meta,
    );
  }

  debug(
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    message?: string,
    meta?: Record<string, any>,
  ) {
    this.logWithStatus(
      'debug',
      context,
      identifier,
      action,
      'debug',
      message,
      meta,
    );
  }

  fail(
    context: LogContext,
    identifier?: string,
    action?: LogAction,
    error?: Error | string,
    meta?: Record<string, any>,
  ) {
    const msg =
      typeof error === 'string' ? error : (error?.message ?? 'Unknown error');
    const trace =
      typeof error === 'object' && (error as Error).stack
        ? (error as Error).stack
        : undefined;
    this.logWithStatus(
      'error',
      context,
      identifier,
      action,
      'failed',
      msg,
      meta,
      trace,
    );
  }
}
