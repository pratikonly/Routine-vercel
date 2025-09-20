const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Auto-create tables if not exist
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS days (
      id SERIAL PRIMARY KEY,
      day_name VARCHAR(20) NOT NULL,
      date DATE NOT NULL UNIQUE
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
      time_from TIME NOT NULL,
      time_to TIME NOT NULL,
      duration VARCHAR(10) NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL
    );
  `);
}
initDB().catch(console.error);

// API Endpoints
app.get('/api/days', async (req, res) => {
  try {
    const { rows: days } = await pool.query('SELECT * FROM days ORDER BY date ASC');
    const tasksQuery = await pool.query('SELECT * FROM tasks ORDER BY day_id, time_from ASC');
    const tasks = tasksQuery.rows;
    const daysWithTasks = days.map(day => ({
      ...day,
      tasks: tasks.filter(t => t.day_id === day.id)
    }));
    res.json(daysWithTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/days', async (req, res) => {
  const { day_name, date } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO days (day_name, date) VALUES ($1, $2) RETURNING *', [day_name, date]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { day_id, time_from, time_to, duration, title, description } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (day_id, time_from, time_to, duration, title, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [day_id, time_from, time_to, duration, title, description]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
