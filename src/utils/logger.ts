import axios from 'axios';

const SERVER_URL = 'http://192.168.1.48:3000/api/admin/logs';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  async log(level: LogLevel, message: string, metadata?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
    };

    // Add to local buffer
    this.logs = [entry, ...this.logs].slice(0, 50);
    this.notify();

    // Console log for debugging
    console.log(`[${level.toUpperCase()}] ${message}`, metadata || '');

    // Send to server
    try {
      await axios.post(SERVER_URL, {
        level,
        message,
        metadata,
      });
    } catch (e) {
      console.warn('Failed to send log to server', e);
    }
  }

  info(message: string, metadata?: any) { return this.log('info', message, metadata); }
  warn(message: string, metadata?: any) { return this.log('warn', message, metadata); }
  error(message: string, metadata?: any) { return this.log('error', message, metadata); }

  getLogs() { return this.logs; }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }
}

export const logger = new Logger();
