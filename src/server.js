import express from "express"; // hacer npm i express
import cors from "cors";       // hacer npm i cors

import config from './configs/db-config.js'
import pkg from 'pg'

const { Client } = pkg;
const client = new Client(config);

const app = express();
const port = 3000;

// Agrego los Middlewares
app.use(cors());         // Middleware de CORS
app.use(express.json()); // Middleware para parsear y comprender JSON

// Conecto a la base
client.connect();

// Acá abajo poner todos los EndPoints

app.get('/api/alumnos', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM alumnos');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/alumnos/:id', async (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).send("ID inválido");

    try {
        const result = await client.query('SELECT * FROM alumnos WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).send("Alumno no encontrado");
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/alumnos', async (req, res) => {
    const { nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;
    if (!nombre || nombre.length < 3) return res.status(400).send("Nombre inválido");

    try {
        await client.query(
            'INSERT INTO alumnos (nombre, apellido, id_curso, fecha_nacimiento, hace_deportes) VALUES ($1, $2, $3, $4, $5)',
            [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes]
        );
        res.status(201).send("Alumno creado");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/alumnos', async (req, res) => {
    const { id, nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;
    if (!nombre || nombre.length < 3) return res.status(400).send("Nombre inválido");

    try {
        const result = await client.query(
            'UPDATE alumnos SET nombre = $1, apellido = $2, id_curso = $3, fecha_nacimiento = $4, hace_deportes = $5 WHERE id = $6',
            [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes, id]
        );
        if (result.rowCount === 0) return res.status(404).send("Alumno no encontrado");
        res.status(201).send("Alumno actualizado");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/alumnos/:id', async (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) return res.status(400).send("ID inválido");

    try {
        const result = await client.query('DELETE FROM alumnos WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).send("Alumno no encontrado");
        res.status(200).send("Alumno eliminado");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inicio el Server y lo pongo a escuchar.
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
