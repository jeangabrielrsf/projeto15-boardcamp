import connection from "../database/database.js";

async function listCustomers(req, res) {
	try {
		const { cpf } = req.query;
		let customersList;

		if (cpf) {
			customersList = await connection.query(
				`
            SELECT * FROM customers WHERE customers.cpf LIKE $1;
        `, [`${cpf}%`]
			);
		} else {
			customersList = await connection.query(`
                SELECT * FROM customers;
            `);
		}


		return res.send(customersList.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function searchCustomer(req, res) {
	try {
		const { id } = req.params;

		const check = await connection.query(
			`
            SELECT * FROM customers WHERE customers.id = $1;
        `,
			[id]
		);

        if (check.rowCount === 0) {
            return res.sendStatus(404);
        }

		return res.send(check.rows);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function insertCustomer(req, res) {
	try {
		const { name, phone, cpf, birthday } = req.body;
		console.log(name, phone, cpf, birthday);

		if (
			name.length === 0 ||
			cpf.length != 11 ||
			phone.length < 10 ||
			phone.length > 11
		) {
			return res.sendStatus(400);
		}

		const cpfCheck = await connection.query(
			`
            SELECT * FROM customers WHERE customers.cpf = $1;
        `,
			[cpf]
		);
		if (cpfCheck.rowCount > 0) {
			return res.sendStatus(409);
		}

		await connection.query(
			`
            INSERT INTO customers (name, cpf, phone, birthday) VALUES ($1, $2, $3, $4);
        `,
			[name, cpf, phone, birthday]
		);
		return res.sendStatus(201);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}

async function updateCustomer (req,res) {
    try {
        const {id} = req.params;
        const {name, phone, cpf, birthday} = req.body;
        if (
			name.length === 0 ||
			cpf.length != 11 ||
			phone.length < 10 ||
			phone.length > 11
		) {
			return res.sendStatus(400);
		}

		const cpfCheck = await connection.query(
			`
            SELECT * FROM customers WHERE customers.cpf = $1;
        `,
			[cpf]
		);
		if (cpfCheck.rowCount > 0) {
			return res.sendStatus(409);
		}

        await connection.query(`
            UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4
            WHERE id = $5;       
        `, [name, phone, cpf, birthday, id]);

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
		return res.sendStatus(500);
    }
}

export { listCustomers, searchCustomer, insertCustomer, updateCustomer };
