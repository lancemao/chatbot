export class Log {

  level: string;
  message: string;
  timestamp: number;

  // 输出日志
  static info(message: string): Log {
    console.log(message);
    return Log.createLog('info', message);
  }
  
  // 输出错误信息
  static error(message: string): Log {
    console.error(message);
    return Log.createLog('error', message);
  }

  static createLog(level: string, message: string): Log {
    const log = new Log();
    log.level = level;
    log.message = message;
    log.timestamp = Date.now();
    return log;
  }
}