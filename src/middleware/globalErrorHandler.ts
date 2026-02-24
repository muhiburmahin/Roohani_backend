import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client"
import { ZodError } from "zod";

function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";
    let errorSources: any[] = [];

    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errorSources = err.issues.map((issue) => {
            return {
                path: issue.path[issue.path.length - 1],
                message: issue.message,
            };
        });
    }

    // ২. Prisma validation error 
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid request data for database";
    }

    // ৩. Prisma known request errors 
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = 409;
                const field = (err.meta?.target as string[])?.join(", ") || "field";
                message = `Duplicate entry: This ${field} already exists.`;
                break;
            case "P2003":
                statusCode = 400;
                message = "The provided ID for a relationship is invalid (Foreign key constraint).";
                break;
            case "P2025":
                statusCode = 404;
                message = "The record you are looking for was not found.";
                break;
            default:
                message = `Database Error: ${err.message}`;
        }
    }

    // ৪. Prisma connection issues 
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = 503;
        message = "Database connection failed. Please try again.";
    }

    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources: errorSources.length > 0 ? errorSources : undefined,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}

export default globalErrorHandler;