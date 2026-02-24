import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { Role } from "../../constants/user";
import { AppError } from "../../middleware/appError";

/**
 * 1. Get Logged-in User's Profile
 */
const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("You are not logged in!", 401);
        }

        const result = await userService.getMyProfile(userId);

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. Get All Users (Admin Only)
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            count: result.length,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 3. Get Admin Dashboard Statistics (Admin Only)
 */
const adminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.adminStats();

        res.status(200).json({
            success: true,
            message: "Admin dashboard statistics retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 4. Get Customer Specific Statistics (Customer Only)
 */
const customerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError("Authentication required", 401);
        }

        const result = await userService.customerStats(userId);

        res.status(200).json({
            success: true,
            message: "Customer order summary retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 5. Update User Profile
 * This logic allows a user to update their own profile, 
 * or an admin to update any profile.
 */
const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const paramId = req.params.id;

        // যদি ID না দেওয়া থাকে তবে নিজেরটা আপডেট হবে
        let targetId = paramId || userId;

        if (!targetId) {
            throw new AppError("Target user ID is missing", 400);
        }

        // সিকিউরিটি চেক: অ্যাডমিন না হলে অন্য কারো প্রোফাইল আপডেট করতে পারবে না
        if (userRole !== Role.admin && paramId && paramId !== userId) {
            throw new AppError("You are not authorized to update this profile!", 403);
        }

        const result = await userService.updateProfile(targetId as string, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const userController = {
    getMyProfile,
    getAllUsers,
    adminStats,
    customerStats,
    updateProfile
};