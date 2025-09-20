// src/Pages/ItemUpdatePage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ItemUpdatePage() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/api/items/${id}`);
        const item = response.data;
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item for update:", err);
        setError("Failed to load item for editing.");
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.put(`http://localhost:7000/api/items/${id}`, {
        name,
        description,
        price: parseFloat(price),
      });
      setMessage(response.data.message || 'Item updated successfully!');
      setTimeout(() => {
        navigate('/'); // Navigate back to the local page after a short delay
      }, 1500);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading item data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Item (ID: {id})</h1>
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
            step="0.01"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Item
          </button>
        </div>
      </form>
      {message && <p className="text-green-500 text-sm italic">{message}</p>}
      {error && <p className="text-red-500 text-sm italic">{error}</p>}
      <button 
        onClick={() => navigate('/')} 
        className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  );
}

export default ItemUpdatePage;