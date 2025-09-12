const pool = require('../config/db');

// In MySQL, boolean is stored as 0 or 1.
const formatTask = (task) => ({
    ...task,
    completed: !!task.completed,
});

const Task = {
  // GET all tasks
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return rows.map(formatTask);
  },

  // GET a single task by ID
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows.length ? formatTask(rows[0]) : null;
  },

  // POST a new task
  create: async (taskData) => {
    const { title } = taskData;
    const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
    const id = result.insertId;
    return { id, title, completed: false };
  },

  // PUT (update) a task
  update: async (id, taskData) => {
    const { title, completed } = taskData;

    // Build the query dynamically based on what's provided
    let query = 'UPDATE tasks SET ';
    const params = [];

    if (title !== undefined) {
      query += 'title = ?';
      params.push(title);
    }

    if (completed !== undefined) {
      if (params.length > 0) query += ', ';
      query += 'completed = ?';
      params.push(completed);
    }
    
    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    return Task.findById(id); // Return the updated task
  },

  // DELETE a task
  remove: async (id) => {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows; // Returns 1 if successful, 0 if not found
  },
};

module.exports = Task;