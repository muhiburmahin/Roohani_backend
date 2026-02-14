// import { NextFunction, Request, Response } from "express";
// import { medicineService } from "./product.service";
// import { AppError } from "../../middleware/appError";
// import { calculatePagination } from "../../helpers/paginationHelper"
// import { ParsedQs } from "qs";

// function pick(query: ParsedQs, fields: string[]): Record<string, any> {
//     const result: Record<string, any> = {};
//     fields.forEach(field => {
//         if (query[field] !== undefined) {
//             result[field] = query[field];
//         }
//     });
//     return result;
// }

// const createMedicine = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const medicineData = req.body;
//         const sellerId = req.user?.id;
//         if (!sellerId) {
//             throw new AppError("You must be logged in to add medicine", 401);
//         }
//         const result = await medicineService.createMedicine({
//             ...medicineData, sellerId
//         });
//         res.status(201).json({
//             success: true,
//             message: "Medicine created!",
//             data: result
//         });
//     }
//     catch (error: any) {
//         next(error);
//     }
// };

// const getAllMedicines = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const filters = pick(req.query, ['search', 'categoryId']);

//         const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

//         const result = await medicineService.getAllMedicines(filters, options);

//         res.status(200).json({
//             success: true,
//             statusCode: 200,
//             message: "Medicines retrieved successfully",
//             meta: result.meta,
//             data: result.data
//         });
//     }
//     catch (error) {
//         next(error);
//     }
// };

// const getMedicineById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const result = await medicineService.getMedicineById(req.params.id as string);
//         res.status(200).json({
//             success: true,
//             message: "Medicines get successfully!",
//             data: result
//         });
//     }
//     catch (error) {
//         next(error);
//     }
// };

// const updateMedicineById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const medicineId = req.params.id;
//         const userId = req.user!.id;
//         const userRole = req.user!.role;
//         const result = await medicineService.updateMedicineById(medicineId as string, userId, userRole, req.body);
//         res.status(200).json({
//             success: true,
//             message: "Medicine updated!",
//             data: result
//         });
//     }
//     catch (error) {
//         next(error);
//     }
// };

// const deleteMedicineById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const medicineId = req.params.id;
//         const userId = req.user!.id;
//         const userRole = req.user!.role;

//         await medicineService.deleteMedicineById(medicineId as string, userId, userRole);
//         res.status(200).json({
//             success: true,
//             message: "Medicine deleted successfully!"
//         });
//     }
//     catch (error) {
//         next(error);
//     }
// };

// export const medicineController = {
//     createMedicine,
//     getAllMedicines,
//     getMedicineById,
//     updateMedicineById,
//     deleteMedicineById,
// };

