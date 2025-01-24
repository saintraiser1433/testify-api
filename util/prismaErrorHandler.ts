import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { appLogger } from './logger';

export const handlePrismaError = (error: unknown, res: Response): Response => {
    const err = error instanceof Error ? error : new Error('Unknown error');
    appLogger.error("Error during request processing:", {
        message: err.message,
        stack: err.stack,
        body: res.req.body,
        params: res.req.params,
        route: res.req.originalUrl,
        method: res.req.method,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        appLogger.error("Prisma error:", {
            code: error.code,
            message: error.message,
            meta: error.meta, 
        });
        switch (error.code) {
            case 'P2025':
                // Record not found
                return res.status(404).json({
                    message: "Record not found",
                });
            case 'P2002':
                // Unique constraint violation
                return res.status(409).json({
                    message: "A record with this data already exists",
                });
            case 'P2003':
                // Foreign key constraint violation
                return res.status(400).json({
                    message: "Invalid reference: The related record does not exist",
                });
            case 'P2000':
                // Data too long for column
                return res.status(400).json({
                    message: "The provided data is too long for one or more fields",
                });
            case 'P2001':
                // Record does not exist (filtered query)
                return res.status(404).json({
                    message: "The requested record does not exist",
                });
            default:
                // Handle other Prisma errors
                return res.status(500).json({
                    message: "An unexpected database error occurred",
                    details: error.message,
                });
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Handle validation errors
        return res.status(400).json({
            message: "Invalid data provided",
            details: error.message,
        });
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        // Handle database connection errors
        return res.status(500).json({
            message: "Failed to connect to the database",
            details: error.message,
        });
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        // Handle Rust panic errors
        return res.status(500).json({
            message: "A critical database error occurred",
            details: error.message,
        });
    } else {
        // Handle generic errors
        const err = error instanceof Error ? error : new Error('Unknown error');
        return res.status(500).json({
            message: "An unexpected error occurred",
            details: err.message,
        });
    }
};