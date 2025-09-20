// src/Pages/DataPostPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataPostPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); // Assuming you have a 'description' column
  const [price, setPrice] = useState(''); // Assuming a 'price' column
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:7000/api/items', {
        name,
        description,
        price: parseFloat(price), // Ensure price is a number
      });
      setMessage(response.data.message || 'Item added successfully!');
      setName('');
      setDescription('');
      setPrice('');
      // Optionally navigate back to the Local page after successful post
      navigate('/'); 
    } catch (err) {
      console.error('Error posting data:', err);
      setError(err.response?.data?.message || 'Failed to add item. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Item</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Item Name:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description:
          </label>
          <input
            type="text"
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            Price:
          </label>
          <input
            type="number"
            id="price"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01" // Allows decimal values
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Item
          </button>
        </div>
      </form>
      {message && <p className="text-green-500 text-sm italic">{message}</p>}
      {error && <p className="text-red-500 text-sm italic">{error}</p>}
      <button 
        onClick={() => navigate('/')} 
        className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Local Page
      </button>
    </div>
  );
}

export default DataPostPage;