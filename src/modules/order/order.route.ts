import express from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../constants/user";
import { orderController } from "./order.controller";

const router = express.Router();

router.get(
    "/",
    auth(Role.customer, Role.admin),
    orderController.getAllOrders
);

// ২. নির্দিষ্ট অর্ডার দেখা
router.get(
    "/:id",
    auth(Role.customer, Role.admin),
    orderController.getOrderById
);

router.post(
    "/",
    auth(Role.customer, Role.admin),
    orderController.createOrder
);

router.patch(
    "/update-status/:id",
    auth(Role.admin),
    orderController.updateOrderStatus
);

router.delete(
    "/:id",
    auth(Role.admin),
    orderController.deleteOrder // আপডেট করা নাম
);

// ৬. অর্ডার ক্যানসেল করা
router.patch(
    "/cancel/:id",
    auth(Role.customer),
    orderController.cancelOrder
);

export const orderRoutes = router;