import connection from "../database/database.js";

async function listCategories(req, res) {
	try {
		const categories = await connection.query(`
        SELECT * FROM categories;
    `);

		res.send(categories.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function createCategory(req, res) {
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
}

export { listCategories, createCategory };
