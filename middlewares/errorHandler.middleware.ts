import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { appLogger } from "../util/logger";


export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): Response => {
    const error = err instanceof Error ? err : new Error("Unknown error");

    appLogger.error("Error during request processing:", {
        message: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        route: req.originalUrl,
        method: req.method,
    });

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        appLogger.error("Prisma error:", {
            code: err.code,
            message: err.message,
            meta: err.meta,
        });

        switch (err.code) {
            case "P2025":
                return res.status(404).json({ message: "Record not found" });
            case "P2002":
                return res.status(409).json({ message: "A record with this data already exists" });
            case "P2003":
                return res.status(400).json({ message: "Error! Please remove first connected data before deleting the parent" });
            case "P2000":
                return res.status(400).json({ message: "The provided data is too long for one or more fields" });
            case "P2001":
                return res.status(404).json({ message: "The requested record does not exist" });
            default:
                return res.status(500).json({ message: "An unexpected database error occurred", details: err.message });
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({ message: "Invalid data provided", details: err.message });
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        return res.status(500).json({ message: "Failed to connect to the database", details: err.message });
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        return res.status(500).json({ message: "A critical database error occurred", details: err.message });
    }

    return res.status(500).json({ message: "An unexpected error occurred", details: error.message });
};