import express from "express";
import auth from "../../middleware/atth"; // তোমার ফাইলে নামের বানানে হয়তো ভুল ছিল (atth)
import { userController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

// Get won Profile
router.get("/user/me", auth(Role.CUSTOMER, Role.ADMIN, Role.SELLER), userController.getMyProfile);
//Get all users
router.get("/admin/users", auth(Role.ADMIN), userController.getAllUsers);

router.get("/admin/stats", auth(Role.ADMIN), userController.adminStats);
router.get("/seller/stats", auth(Role.SELLER), userController.sellerStats);
router.get("/customer/stats", auth(Role.CUSTOMER), userController.customerStats);
//To update your profile yourself
router.patch("/user/update/:id", auth(Role.CUSTOMER, Role.SELLER, Role.ADMIN), userController.updateProfile);

// Only admin access will be available (to control others)
router.patch("/admin/users/:id", auth(Role.ADMIN), userController.updateProfile);

export const userRoutes = router;