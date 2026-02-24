import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    plugins: [],

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
    },
    beforeSessionCreate: async ({ session, user }: { session: any, user: any }) => {
        return { session, user };
    },

    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:5000"
    ],

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CUSTOMER",
                required: false,
                input: false
            },
            phone: {
                type: "string",
                required: true
            },
            username: {
                type: "string",
                required: true
            }
        },
    },
});