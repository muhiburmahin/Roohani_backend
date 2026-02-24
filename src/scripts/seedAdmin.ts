// src/scripts/seedAdmin.ts
import { prisma } from "../lib/prisma";
import { hashPassword } from "better-auth/crypto";

async function seedAdmin() {
    const adminPhone = "01712000000";
    const shadowEmail = `${adminPhone}@roohani.local`;

    // ১. আগের ডাটা ডিলিট করুন (যাতে ফ্রেশ ইনসার্ট হয়)
    //await prisma.user.deleteMany({ where: { email: shadowEmail } });

    // ২. পাসওয়ার্ড সঠিক ফরম্যাটে হ্যাশ করুন
    const hashedPassword = await hashPassword("adminroohanibd12");

    // ৩. সরাসরি Prisma দিয়ে User ও Account তৈরি করুন
    await prisma.user.create({
        data: {
            name: "Roohani Admin",
            email: shadowEmail,
            phone: adminPhone,
            username: adminPhone,
            role: "ADMIN",
            emailVerified: true,
            accounts: {
                create: [{
                    id: crypto.randomUUID(), // Manual ID দিতে হবে
                    providerId: "credential",
                    accountId: shadowEmail,
                    password: hashedPassword,
                }]
            }
        }
    });
    console.log("✅ Admin seeded as ADMIN with Shadow Email!");
}
seedAdmin();

// import { prisma } from "../lib/prisma";

// async function seedAdmin() {
//     try {
//         const phone = "01713000000";
//         const password = "adminroohanibd";
//         const shadowEmail = `${phone}@roohani.local`;

//         const adminData = {
//             name: "Roohani Admin",
//             email: shadowEmail,
//             phone: phone,
//             username: phone,
//             role: "ADMIN",
//             password: password
//         };

//         // ডাটাবেস থেকে পুরনো ভুল ডেটা মুছে ফেলা (যাতে ফ্রেশ এন্ট্রি হয়)
//         await prisma.user.deleteMany({
//             where: { email: shadowEmail }
//         });
//         console.log("🧹 Previous admin data cleared.");

//         console.log("🚀 Sending request to Better Auth Sign-up API...");

//         // হেডার সেকশনে অবশ্যই 'origin' যোগ করতে হবে
//         const response = await fetch("http://localhost:5000/api/auth/sign-up/email", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "origin": "http://localhost:3000" // এই লাইনটি যোগ করুন
//             },
//             body: JSON.stringify(adminData)
//         });

//         const result = await response.json();

//         if (response.ok) {
//             console.log("✅ Admin created successfully:", result);
//         } else {
//             console.error("❌ API Error:", result);
//         }

//     } catch (error) {
//         console.error("❌ Error:", error);
//     } finally {
//         await prisma.$disconnect();
//     }
// }

// seedAdmin();