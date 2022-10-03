import express from "express";
import { createGame, listGames } from "../controllers/games.controller.js";

const gamesRouter = express.Router();
gamesRouter.get("/games", listGames);
gamesRouter.post("/games", createGame);

export default gamesRouter;
