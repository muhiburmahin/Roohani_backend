import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role } from "../constants/user";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:5000"
    ],

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