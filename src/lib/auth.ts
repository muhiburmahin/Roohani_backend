import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role } from "../constants/user";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    trustedOrigins: ["http://localhost:3000"],

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: Role.customer,
                required: false,
                allowedValues: [Role.customer, Role.admin],
            },
            phone: {
                type: "string",
                required: false
            }
        },
    },
});