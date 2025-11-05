// src/config/enum/log-level.enum.ts

export enum LogLevel {
  DEBUG = 1, // Lowest severity, verbose output
  INFO = 2, // General informational messages
  WARN = 3, // Warning, something might be wrong
  ERROR = 4, // Error, requires attention
  FATAL = 5, // Critical error, system may be unstable
}
