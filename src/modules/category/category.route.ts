import express from "express";
import { categoryController } from "./category.controller";
//import auth from "../../middleware/atth";
//import { Role } from "../../../generated/prisma/enums";
const route = express.Router();



route.get("/", categoryController.getAllCategories);

route.post("/", categoryController.createCategory);

route.delete("/:id", categoryController.deleteCategoryById);

export const categoryRoute = route;

//auth(Role.ADMIN)