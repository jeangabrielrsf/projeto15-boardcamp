import connection from "../database/database.js";

async function listGames(req, res) {
	try {
		const gamesList = await connection.query(`
            SELECT * FROM games;
        `);

		return res.send(gamesList.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function createGame(req, res) {
	try {
		const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

		const categoryCheck = await connection.query(
			`
			SELECT * FROM categories WHERE categories.id = $1; 
		`,
			[categoryId]
		);

		if (
			name.length === 0 ||
			stockTotal === 0 ||
			pricePerDay === 0 ||
			categoryCheck.rowCount === 0
		) {
			return res.sendStatus(400);
		}

		const nameCheck = await connection.query(
			`
            SELECT name FROM games WHERE games.name = $1;
        `,
			[name]
		);

		if (nameCheck.rowCount != 0) {
			return res.sendStatus(409);
		}

		connection.query(
			`
		 INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
		 VALUES ($1, $2, $3, $4, $5);
		`,
			[name, image, stockTotal, categoryId, pricePerDay]
		);

		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export { listGames, createGame };
