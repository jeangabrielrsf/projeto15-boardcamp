import express from "express";
import { deleteRental, insertRental, listRentals, returnRental } from "../controllers/rentals.controller.js";

const rentalsRouter = express.Router();
rentalsRouter.get("/rentals", listRentals);
rentalsRouter.post("/rentals", insertRental);
rentalsRouter.post("/rentals/:id/return", returnRental);
rentalsRouter.delete("/rentals/:id", deleteRental);

export default rentalsRouter;