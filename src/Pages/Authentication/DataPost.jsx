// src/Pages/Authentication/DataPost.jsx - NEW VERSION

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const CATEGORIES = ["Ghee & Oil", "Rice & Pulses", "Snacks & Spices", "Cold Drinks"];

function DataPost() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // State to hold the file object
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { api } = useAuth(); // Use the authenticated api instance

  const createProduct = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !image) {
      setError("Please fill in all fields and choose an image.");
      return;
    }

    // FormData is required for sending files
    const formData = new FormData();
    formData.append('category', category);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('image', image); // The key 'image' must match the multer field name in the backend

    try {
      await api.post("/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("New product added successfully!");
      navigate("/DataFetch"); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add new product.";
      console.error("Error creating product:", err);
      setError(errorMessage);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Link 
        className="font-bold text-xl border border-black bg-yellow-400 px-4 py-2 mb-4 inline-block rounded" 
        to="/DataFetch"
      >
        Back to Product Dashboard
      </Link>
      <h1 className="text-2xl mb-4">Add New Product</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      
      <form onSubmit={createProduct} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Choose Category</label>
          <select 
            id="category"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 w-full rounded mt-1"
            required
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input 
            id="name"
            type="text" 
            placeholder="e.g., Basmati Rice 1kg" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="border p-2 w-full rounded mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Product Price</label>
          <input 
            id="price"
            type="number" 
            step="0.01"
            placeholder="e.g., 150.50" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="border p-2 w-full rounded mt-1"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
          <input 
            id="image"
            type="file" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])} 
            className="border p-2 w-full rounded mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}

export default DataPost;