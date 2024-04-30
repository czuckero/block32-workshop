// import packages
const pg = require('pg');
const express = require('express');
const app = express();

// client connection
const client = new pg.Client(
    process.env.DATABASE_URL || 'postgres://localhost/block32-icecreamshop'
);

app.use(express.json());
app.use(require('morgan')('dev'));

// GET
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// GET SINGLE FLAVOR
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * FROM flavors
        WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        INSERT INTO flavors(name, is_favorite)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
        res.send(response.rows[0])
    } catch (error) {
        next(error);
    }
});

// PUT
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
});

// DELETE
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE from flavors
        WHERE id=$1
        `;
        await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
});

// init function
const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );
    `;
    await client.query(SQL);
    console.log('tables created');
    
    // seed flavor data
    SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Pistachio', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Superman', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Mint Chip', false);
    `;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
};

init();