import express from "express";
import {
	insertCustomer,
	listCustomers,
	searchCustomer,
    updateCustomer,
} from "../controllers/customers.controller.js";

const customersRouter = express.Router();
customersRouter.get("/customers", listCustomers);
customersRouter.get("/customers/:id", searchCustomer);
customersRouter.post("/customers", insertCustomer);
customersRouter.put("/customers/:id", updateCustomer);

export default customersRouter;
