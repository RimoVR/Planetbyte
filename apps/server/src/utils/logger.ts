/**
 * Logger utility for the server
 */

// Define log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Get log level from environment or default to INFO
const currentLogLevel = process.env.LOG_LEVEL 
  ? (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO) 
  : LogLevel.INFO;

// Logger class
class Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message));
    }
  }

  info(message: string): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message));
    }
  }

  warn(message: string): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  error(message: string): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message));
    }
  }
}

// Export singleton instance
export const logger = new Logger();