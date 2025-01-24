import expressWinston from 'express-winston';
import { createLogger, transports, format } from 'winston';
import path from 'path';

export const appLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.metadata()
    ),
    transports: [
        // Console transport for development
        // new transports.Console({
        //     format: format.combine(
        //         format.colorize(),
        //         format.simple()
        //     )
        // }),
        // File transport for error logs
        new transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            handleExceptions: true
        }),
        // File transport for combined logs
        new transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            handleExceptions: true
        })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV === 'development') {
    appLogger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

// Express middleware logger
export const expressLogger = expressWinston.logger({
    winstonInstance: appLogger,
    meta: true,
    colorize: true,
    expressFormat: true,
    statusLevels: true
});

// Error logging middleware
export const errorLogger = expressWinston.errorLogger({
    winstonInstance: appLogger,

});