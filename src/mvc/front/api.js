// src/api.js
import axios from 'axios';

// The base URL for your backend API
// This should match the port your server.js is running on (e.g., 5000)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchData = async () => {
  try {
    const response = await api.get('/items'); // Adjusted to /api/items route
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (newItem) => {
  try {
    const response = await api.post('/items', newItem); // Adjusted to /api/items route
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export const updateData = async (id, updatedItem) => {
  try {
    const response = await api.put(`/items/${id}`, updatedItem); // Adjusted to /api/items/:id route
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

export const deleteData = async (id) => {
  try {
    const response = await api.delete(`/items/${id}`); // Adjusted to /api/items/:id route
    return response.data;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw error;
  }
};

export default api;