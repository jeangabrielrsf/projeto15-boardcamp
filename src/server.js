import express from "express";
import cors from "cors";
import connection from "./database/database.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/categories", async (req, res) => {
	try {
		const categories = await connection.query(`
        SELECT * FROM categories;
    `);

		res.send(categories.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.post("/categories", async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.sendStatus(400);
		}

		const nameCheck = await connection.query(
			`
            SELECT name FROM categories WHERE categories.name = $1;
        `,
			[name]
		);

		console.log(nameCheck.rows);
		if (nameCheck.rowCount != 0) {
			return res.sendStatus(409);
		}

		connection.query(
			`
            INSERT INTO categories (name) VALUES ($1);
        `,
			[name]
		);

		res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.get("/games", async (req, res) => {
	try {
		const gamesList = await connection.query(`
            SELECT * FROM games;
        `);

		return res.send(gamesList.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

app.listen(4000, () => console.log("Listening on port 4000..."));
