/**
 * Logger - Központosított logging rendszer
 * Lehetővé teszi a debug logok kikapcsolását production környezetben
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export class Logger {
  private static currentLevel: LogLevel = this.getLogLevelFromEnvironment();
  
  /**
   * Log szint beállítása környezet alapján
   */
  private static getLogLevelFromEnvironment(): LogLevel {
    // Development módban minden log látszik, production-ben csak ERROR
    if (process.env.NODE_ENV === 'production') {
      return LogLevel.ERROR;
    }
    
    // Alapértelmezetten INFO szint (DEBUG kikapcsolva)
    return LogLevel.INFO;
  }
  
  /**
   * Log szint manuális beállítása
   */
  public static setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
  
  /**
   * Debug üzenet - csak development módban látszik
   */
  public static debug(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.log(`🔍 DEBUG: ${message}`, ...args);
    }
  }
  
  /**
   * Info üzenet - development és production módban is látszik
   */
  public static info(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.INFO) {
      console.log(`ℹ️ INFO: ${message}`, ...args);
    }
  }
  
  /**
   * Figyelmeztetés - mindig látszik
   */
  public static warn(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(`⚠️ WARN: ${message}`, ...args);
    }
  }
  
  /**
   * Hiba - mindig látszik
   */
  public static error(message: string, ...args: any[]): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      console.error(`🚨 ERROR: ${message}`, ...args);
    }
  }
  
  /**
   * Időzítő - csak development módban működik
   */
  public static timer(label: string): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.time(label);
    }
  }
  
  /**
   * Időzítő leállítása - csak development módban működik
   */
  public static timerEnd(label: string): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.timeEnd(label);
    }
  }
  
  /**
   * Csoport kezdete - csak development módban működik
   */
  public static group(label: string): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.group(label);
    }
  }
  
  /**
   * Csoport vége - csak development módban működik
   */
  public static groupEnd(): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.groupEnd();
    }
  }
}