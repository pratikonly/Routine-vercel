     const express = require('express');
     const { Pool } = require('@neondatabase/serverless');
     const path = require('path');
     const app = express();
     const port = process.env.PORT || 3000;

     // Middleware
     app.use(express.json());
     app.use(express.static('public'));

     // Serve index.html for root
     app.get('/', (req, res) => {
       res.sendFile(path.join(__dirname, 'public', 'index.html'));
     });

     // Database connection
     const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
     });

     // Initialize database
     async function initDb() {
       try {
         await pool.query(`
           CREATE TABLE IF NOT EXISTS days (
             id SERIAL PRIMARY KEY,
             day_name TEXT NOT NULL,
             date DATE NOT NULL
           );
           CREATE TABLE IF NOT EXISTS tasks (
             id SERIAL PRIMARY KEY,
             day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
             time_from TIME NOT NULL,
             time_to TIME NOT NULL,
             title TEXT NOT NULL,
             description TEXT,
             duration TEXT
           );
         `);
       } catch (err) {
         console.error('Error initializing database:', err);
       }
     }
     initDb();

     // API Routes
     app.get('/api/days', async (req, res) => {
       try {
         const daysResult = await pool.query('SELECT * FROM days ORDER BY date ASC');
         const days = daysResult.rows;
         for (let day of days) {
           const tasksResult = await pool.query('SELECT * FROM tasks WHERE day_id = $1 ORDER BY time_from ASC', [day.id]);
           day.tasks = tasksResult.rows;
         }
         res.json(days);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.post('/api/days', async (req, res) => {
       const { day_name, date } = req.body;
       try {
         const result = await pool.query('INSERT INTO days (day_name, date) VALUES ($1, $2) RETURNING *', [day_name, date]);
         res.json(result.rows[0]);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.patch('/api/days/:id', async (req, res) => {
       const { id } = req.params;
       const { day_name, date } = req.body;
       try {
         const result = await pool.query('UPDATE days SET day_name = $1, date = $2 WHERE id = $3 RETURNING *', [day_name, date, id]);
         if (result.rowCount === 0) {
           return res.status(404).json({ error: 'Day not found' });
         }
         res.json(result.rows[0]);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.delete('/api/days/:id', async (req, res) => {
       const { id } = req.params;
       try {
         const result = await pool.query('DELETE FROM days WHERE id = $1 RETURNING *', [id]);
         if (result.rowCount === 0) {
           return res.status(404).json({ error: 'Day not found' });
         }
         res.json({ message: 'Day deleted' });
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.post('/api/tasks', async (req, res) => {
       const { day_id, time_from, time_to, title, description, duration } = req.body;
       try {
         const result = await pool.query(
           'INSERT INTO tasks (day_id, time_from, time_to, title, description, duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
           [day_id, time_from, time_to, title, description, duration]
         );
         res.json(result.rows[0]);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.patch('/api/tasks/:id', async (req, res) => {
       const { id } = req.params;
       const { time_from, time_to, title, description, duration } = req.body;
       try {
         const result = await pool.query(
           'UPDATE tasks SET time_from = $1, time_to = $2, title = $3, description = $4, duration = $5 WHERE id = $6 RETURNING *',
           [time_from, time_to, title, description, duration, id]
         );
         if (result.rowCount === 0) {
           return res.status(404).json({ error: 'Task not found' });
         }
         res.json(result.rows[0]);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.delete('/api/tasks/:id', async (req, res) => {
       const { id } = req.params;
       try {
         const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
         if (result.rowCount === 0) {
           return res.status(404).json({ error: 'Task not found' });
         }
         res.json({ message: 'Task deleted' });
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal server error' });
       }
     });

     app.listen(port, () => {
       console.log(`Server running on port ${port}`);
     });
