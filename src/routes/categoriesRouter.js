import express from "express";
import {
	createCategory,
	listCategories,
} from "../controllers/categories.controller.js";

const categoriesRouter = express.Router();
categoriesRouter.get("/categories", listCategories);
categoriesRouter.post("/categories", createCategory);

export default categoriesRouter;
