import express from "express";
import { userController } from "./user.controller";
import { Role } from "../../constants/user";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.get("/me", auth(Role.customer, Role.admin), userController.getMyProfile);

router.get("/all-users", auth(Role.admin), userController.getAllUsers);

router.get("/admin-stats", auth(Role.admin), userController.adminStats);

router.get("/customer-stats", auth(Role.customer), userController.customerStats);


router.patch("/update-profile/:id", auth(Role.admin), userController.updateProfile);

router.patch("/update-profile", auth(Role.customer, Role.admin), userController.updateProfile);

export const userRoutes = router;