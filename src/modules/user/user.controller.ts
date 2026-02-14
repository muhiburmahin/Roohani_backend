import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/appError";
import { User } from "../../../generated/prisma/client";


const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const result = await userService.getMyProfile(userId);

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

//Get All Users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            message: "All users retrieved successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
const adminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.adminStats();
        res.status(200).json({
            success: true,
            message: "Admin stats fetched successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

const sellerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.sellerStats();
        res.status(200).json({
            success: true,
            message: "Seller stats fetched successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
};

const customerStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const result = await userService.customerStats(user as Partial<User>);
        res.status(200).json({
            success: true,
            message: "Customer stats fetched successfully!",
            data: result,
        });
    } catch (error: any) {
        next(error);
    }
}


const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const targetId = req.params.id || req.user!.id;
        const userRole = req.user!.role;

        if (userRole !== 'ADMIN') {
            delete req.body.role;
            delete req.body.email;
            if (req.params.id && req.params.id !== req.user!.id) {
                throw new AppError("You can only update your own profile!", 403);
            }
        }

        const result = await userService.updateProfile(targetId as string, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};

export const userController = {
    getMyProfile,
    getAllUsers,
    adminStats,
    sellerStats,
    customerStats,
    updateProfile

};