import log from 'loglevel';

if (import.meta.env.PROD) {
  // display logs of type: warn, error)
  log.setLevel('warn');
} else {
  // display logs of type: debug, info, warn, error)
  log.setLevel('debug');
}

export class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private formatMessage(message: string, meta?: Record<string, unknown>): [string, ...unknown[]] {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${this.prefix}] ${message}`;
    return meta ? [baseMessage, meta] : [baseMessage];
  }

  info(message: string, meta?: Record<string, unknown>): void {
    log.info(...this.formatMessage(message, meta));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    const errorMeta = {
      ...meta,
      errorMessage: error?.message,
      stack: error?.stack,
    };
    log.error(...this.formatMessage(message, errorMeta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    log.warn(...this.formatMessage(message, meta));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    log.debug(...this.formatMessage(message, meta));
  }
}

export const taxCalculatorLogger = new Logger('TaxCalculator');
