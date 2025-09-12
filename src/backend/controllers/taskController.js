const Task = require('../models/taskModel');

// @desc    Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Create a task
const createTask = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ message: 'Please provide a title' });
  }
  try {
    const task = await Task.create({ title: req.body.title });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Update a task
const updateTask = async (req, res) => {
  try {
    const taskExists = await Task.findById(req.params.id);
    if (!taskExists) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const updatedTask = await Task.update(req.params.id, req.body);
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Delete a task
const deleteTask = async (req, res) => {
  try {
    const affectedRows = await Task.remove(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ id: parseInt(req.params.id) }); // Send back the id for frontend state update
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };