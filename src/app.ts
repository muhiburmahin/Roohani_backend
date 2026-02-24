import express, { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { categoryRoute } from "./modules/category/category.route";
import { productRoute } from "./modules/product/product.route";
import { auth } from "./lib/auth";
import { orderRoutes } from "./modules/order/order.route";
import { userRoutes } from "./modules/user/user.route";

const app = express();


// app.use(cors({
//     origin: process.env.APP_URL || "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
// }));

app.use(cors({
    origin: function (origin, callback) {

        const allowedOrigins = [
            process.env.APP_URL,
            "http://localhost:3000",
            "http://localhost:5000" // ✅ add this
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("The CORS policy for this site does not allow access from the specified Origin."));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.all("/api/auth/*splat", toNodeHandler(auth));


app.get("/", (request: Request, respons: Response) => {
    respons.send("Hello world");
});


app.use("/api/category", categoryRoute);

app.use("/api/product", productRoute);

app.use("/api/order", orderRoutes);

app.use("/api/user", userRoutes);


export default app;




