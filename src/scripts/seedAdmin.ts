import { prisma } from "../lib/prisma";
import { Role } from "../constants/user";

async function seedAdmin() {
    try {
        const adminData = {
            name: "Roohani Admin",
            email: "admin@roohani1.com",
            role: Role.admin,
            password: "adminroohanibd"
        };

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (existingAdmin) {
            console.log("ℹ️ Admin already exists in DB! Skipping API call.");
            return;
        }

        console.log("🚀 Sending request to Sign-up API...");

        const response = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000"
            },
            body: JSON.stringify(adminData)
        });

        const text = await response.text();

        console.log("Raw response:", text);
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            console.error("❌ Response is not JSON");
            return;
        }
    }
    catch (error) {
        console.error("❌ Network or Server Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();