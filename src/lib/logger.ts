/**
 * Structured Logger — ISO 25010 Observability (Metrics, Logs, Traces)
 *
 * Provides a thin structured-logging layer over console that:
 * - Adds log levels (debug, info, warn, error)
 * - Stamps ISO-8601 timestamps
 * - Attaches structured context objects (JSON-serialisable)
 * - Suppresses debug output in production
 * - Can be upgraded to a remote sink (Sentry, Datadog, etc.) without
 *   changing call sites — just swap the transport in `emit()`.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

type Transport = (entry: LogEntry) => void;

const IS_PROD = import.meta.env.PROD;

/** Console transport — always active */
const consoleTransport: Transport = (entry) => {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const fn = entry.level === 'error'
    ? console.error
    : entry.level === 'warn'
      ? console.warn
      : entry.level === 'debug'
        ? console.debug
        : console.info;

  if (entry.context) {
    fn(prefix, entry.message, entry.context);
  } else {
    fn(prefix, entry.message);
  }
};

/** Remote transport placeholder — swap with Sentry/Datadog SDK when ready */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const remoteTransport: Transport = (_entry: LogEntry) => {
  // TODO: send to remote observability platform (Sentry, Datadog, etc.)
};

const transports: Transport[] = IS_PROD
  ? [consoleTransport, remoteTransport]
  : [consoleTransport];

function emit(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): void {
  // Suppress debug logs in production
  if (IS_PROD && level === 'debug') return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  for (const transport of transports) {
    try {
      transport(entry);
    } catch {
      // Never let logging crash the app
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    emit('debug', message, context),

  info: (message: string, context?: Record<string, unknown>) =>
    emit('info', message, context),

  warn: (message: string, context?: Record<string, unknown>) =>
    emit('warn', message, context),

  error: (message: string, context?: Record<string, unknown>) =>
    emit('error', message, context),
} as const;
