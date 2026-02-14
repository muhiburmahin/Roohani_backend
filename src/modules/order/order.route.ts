import express from "express";
import auth from "../../middleware/atth";
import { Role } from "../../../generated/prisma/enums";
import { orderController } from "./order.controller";
const router = express.Router();



router.get("/", auth(Role.CUSTOMER, Role.SELLER, Role.ADMIN), orderController.getOrders);
router.get("/:id", auth(Role.CUSTOMER, Role.SELLER, Role.ADMIN), orderController.getSingleOrderById);


router.post("/", auth(Role.CUSTOMER, Role.SELLER), orderController.createOrder);

router.patch("/update-status/:id", auth(Role.SELLER, Role.ADMIN), orderController.updateStatus);
router.delete("/:id", auth(Role.ADMIN, Role.SELLER), orderController.deleteOrderById);

export const orderRoutes = router; 