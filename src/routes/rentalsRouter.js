import express from "express";
import { insertRental, listRentals } from "../controllers/rentals.controller.js";

const rentalsRouter = express.Router();
rentalsRouter.get("/rentals", listRentals);
rentalsRouter.post("/rentals", insertRental);

export default rentalsRouter;