import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";

import { Role } from "../constants/user";

type RoleType = keyof typeof Role;

export const auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized Access",
                });
            }

            if (roles.length > 0) {
                const userRole = (session.user as any).role;
                if (!roles.includes(userRole)) {
                    return res.status(403).json({
                        success: false,
                        message: "Permission Denied: You don't have the required role",
                    });
                }
            }

            (req as any).user = session.user;

            next();
        }
        catch (error) {
            next(error);
        }
    };
};