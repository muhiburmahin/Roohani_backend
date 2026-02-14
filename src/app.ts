import express, { Request, Response } from "express";
//import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { categoryRoute } from "./modules/category/category.route";

const app = express();


// app.use(cors({
//     origin: process.env.APP_URL || "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
// }));

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [process.env.APP_URL, "http://localhost:3000"];

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}))

app.use(express.json());
//app.all("/api/auth/*splat", toNodeHandler(auth));


app.get("/", (request: Request, respons: Response) => {
    respons.send("Hello world");
});


app.use("/api/category", categoryRoute);

// app.use("/api/medicines", medicineRoute);
// app.use("/api/seller/medicines", medicineRoute);

// app.use("/api/orders", orderRoutes);
// app.use("/api/seller/orders", orderRoutes)

// app.use("/api/analytics", analyticsRoutes);
// app.use("/api/review", reviewRoutes);
// app.use("/api", userRoutes);


export default app;




