import express from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../constants/user";
import { orderController } from "./order.controller";

const router = express.Router();
router.get(
    "/",
    auth(Role.customer, Role.admin),
    orderController.getOrders
);

router.get(
    "/:id",
    auth(Role.customer, Role.admin),
    orderController.getSingleOrderById
);

router.post(
    "/",
    auth(Role.customer),
    orderController.createOrder
);

router.patch(
    "/update-status/:id",
    auth(Role.admin),
    orderController.updateStatus
);

router.delete(
    "/:id",
    auth(Role.admin),
    orderController.deleteOrderById
);

router.patch(
    "/cancel/:id",
    auth(Role.customer),
    orderController.cancelOrder
);

export const orderRoutes = router;