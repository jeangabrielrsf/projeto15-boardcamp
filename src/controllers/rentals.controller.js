import connection from "../database/database.js";
import dayjs from "dayjs";

async function listRentals(req, res) {
	try {
		const { gameId, customerId } = req.query;

		let rentalsList;
		if (customerId) {
			rentalsList = await connection.query(
				`
            SELECT 
                rentals.*, 
                json_build_object('id', customers.id, 'name', customers.name) AS "customer",
                json_build_object(
                    'id', games.id, 
                    'name', games.name, 
                    'categoryId', games."categoryId",
                    'categoryName', categories.name
                     ) AS "game"
            FROM rentals
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id
            JOIN categories ON games."categoryId" = categories.id
            WHERE rentals."customerId" = $1
            ;
        `,
				[customerId]
			);
		} else if (gameId) {
			rentalsList = await connection.query(
				`
            SELECT 
                rentals.*, 
                json_build_object('id', customers.id, 'name', customers.name) AS "customer",
                json_build_object(
                    'id', games.id, 
                    'name', games.name, 
                    'categoryId', games."categoryId",
                    'categoryName', categories.name
                     ) AS "game"
            FROM rentals
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id
            JOIN categories ON games."categoryId" = categories.id
            WHERE rentals."gameId" = $1
            ;
        `,
				[gameId]
			);
		} else {
			rentalsList = await connection.query(`
            SELECT 
                rentals.*, 
                json_build_object('id', customers.id, 'name', customers.name) AS "customer",
                json_build_object(
                    'id', games.id, 
                    'name', games.name, 
                    'categoryId', games."categoryId",
                    'categoryName', categories.name
                     ) AS "game"
            FROM rentals
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id
            JOIN categories ON games."categoryId" = categories.id;
        `);
		}

		return res.send(rentalsList.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function insertRental(req, res) {
	try {
		const { customerId, gameId, daysRented } = req.body;
		const rentDate = dayjs().format("YYYY-MM-DD");
		console.log(rentDate);
		const gameInfo = await connection.query(
			`
            SELECT * FROM games WHERE games.id = $1;
        `,
			[gameId]
		);

		const customerInfo = await connection.query(
			`
            SELECT * FROM customers WHERE customers.id = $1;
        `,
			[customerId]
		);

		const rentalsCheck = await connection.query(
			`
            SELECT * FROM rentals WHERE rentals."gameId" = $1;
        `,
			[gameId]
		);

		if (
			!customerInfo.rows[0] ||
			!gameInfo.rows[0] ||
			daysRented < 1 ||
			rentalsCheck.rowCount >= gameInfo.rows[0].stockTotal
		) {
			console.log("nao tem customer e/ou jogo. Verificar dias alugados");
			return res.sendStatus(400);
		}

		const originalPrice = daysRented * gameInfo.rows[0].pricePerDay;
		const returnDate = null;
		const delayFee = null;

		await connection.query(
			`
            INSERT INTO rentals (
                "customerId", 
                "gameId", 
                "rentDate", 
                "daysRented", 
                "returnDate", 
                "originalPrice", 
                "delayFee"
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                );
        `,
			[
				customerId,
				gameId,
				rentDate,
				daysRented,
				returnDate,
				originalPrice,
				delayFee,
			]
		);

		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function returnRental(req, res) {
	try {
		const { id } = req.params;

		const rentalInfo = await connection.query(
			`
            SELECT * FROM rentals WHERE rentals.id = $1;
        `,
			[id]
		);

		if (rentalInfo.rowCount === 0) {
			return res.sendStatus(404);
		}

		if (rentalInfo.rows[0].returnDate != null) {
			return res.sendStatus(400);
		}

		const rentDate = dayjs(rentalInfo.rows[0].rentDate).format("YYYY-MM-DD");
		console.log(`rentDate: ${rentDate}`);
		const dayLimit = dayjs(rentDate)
			.add(rentalInfo.rows[0].daysRented, "day")
			.format("YYYY-MM-DD");
		console.log(`dia Limite de entrega: ${dayLimit}`);

		const test = dayjs("2022-10-06").format("YYYY-MM-DD");
		console.log(test);

		const returnDate = dayjs().format("YYYY-MM-DD");
		console.log(`returnDate: ${returnDate}`);

		const daysDiff = dayjs(dayLimit).diff(dayjs(returnDate), "d");
		console.log(daysDiff);

		if (daysDiff < 0) {
			//tem multa
			const delayFee = rentalInfo.rows[0].pricePerDay * Math.abs(daysDiff);
			await connection.query(
				`
                UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3; 
            `,
				[returnDate, delayFee, id]
			);
		} else {
			await connection.query(
				`
            UPDATE rentals SET "returnDate" = $1 WHERE id = $2;
        `,
				[returnDate, id]
			);
		}

		return res.sendStatus(200);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function deleteRental(req, res) {
	try {
		const { id } = req.params;

		const idCheck = await connection.query(
			`
            SELECT * FROM rentals WHERE rentals.id = $1;
        `,
			[id]
		);

		if (idCheck.rowCount === 0) {
			return res.sendStatus(404);
		}

        const rentCheck = await connection.query(`
            SELECT * FROM rentals WHERE rentals.id = $1;
        `, [id]);
        if (rentCheck.rows[0].returnDate == null) {
            return res.sendStatus(400);
        }


        await connection.query(`
            DELETE FROM rentals WHERE rentals.id = $1;
        `, [id]);

        return res.sendStatus(200);

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

export { listRentals, insertRental, returnRental, deleteRental };
