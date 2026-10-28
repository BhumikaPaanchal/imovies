
const db = require('./db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the iMovies Backend API!',
        status: 'Running successfully'
    });
});

// Get all movies from MySQL
app.get('/api/movies', (req, res) => {
    const sql = 'SELECT * FROM movies ORDER BY id';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err.message);

            return res.status(500).json({
                error: 'Unable to fetch movies'
            });
        }

        res.json(results);
    });
});

// Get one movie by ID
app.get('/api/movies/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    // Validate movie ID
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid movie ID'
        });
    }

    const sql = 'SELECT * FROM movies WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching movie:', err.message);

            return res.status(500).json({
                error: 'Unable to fetch movie'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Movie not found'
            });
        }

        res.json(results[0]);
    });
});

app.post('/api/movies', (req, res) => {
    const { title, genre, rating, release_year, description, duration, poster } = req.body;

    if (!title || !genre) {
        return res.status(400).json({
            error: 'Title and genre are required'
        });
    }

    const sql = `
        INSERT INTO movies
        (title, genre, rating, release_year, description, duration, poster)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            genre,
            rating || null,
            release_year || null,
            description || null,
            duration || null,
            poster || null
        ],
        (err, result) => {
            if (err) {
                console.error('Error adding movie:', err.message);
                return res.status(500).json({
                    error: 'Unable to add movie'
                });
            }

            res.status(201).json({
                message: 'Movie added successfully',
                id: result.insertId
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`iMovies server running on port ${PORT}`);
});
