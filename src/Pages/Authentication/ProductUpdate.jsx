// src/Pages/Authentication/ProductUpdate.jsx - NEW FILE

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const CATEGORIES = ["Ghee & Oil", "Rice & Pulses", "Snacks & Spices", "Cold Drinks"];

function ProductUpdate() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const { api } = useAuth();

  // State for form fields
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // For new image file
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // To display current image

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the existing product data when the component loads
  useEffect(() => {
    api.get(`/products/${id}`)
      .then(response => {
        const product = response.data;
        setName(product.name);
        setCategory(product.category);
        setPrice(product.price);
        setCurrentImageUrl(`http://localhost:7000/${product.imageUrl}`);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product data:", err);
        setError("Could not fetch product data.");
        setLoading(false);
      });
  }, [id, api]);

  const updateProduct = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('category', category);
    formData.append('name', name);
    formData.append('price', price);
    if (image) { // Only append image if a new one is selected
      formData.append('image', image);
    }

    try {
      // Use PUT request to update the product
      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Product updated successfully");
      navigate("/DataFetch");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update product.";
      console.error("Error updating product:", err);
      setError(errorMessage);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <Link className="font-bold text-xl border border-black bg-yellow-400 px-4 py-2 mb-4 inline-block rounded" to="/DataFetch">
        Back to Dashboard
      </Link>
      <h1 className="text-2xl mb-4">Edit Product</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      
      <form onSubmit={updateProduct} className="space-y-4">
        {/* Form fields are similar to DataPost, but pre-filled with existing data */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full rounded mt-1">
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full rounded mt-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Price</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 w-full rounded mt-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Image</label>
          {currentImageUrl && <img src={currentImageUrl} alt="Current product" className="h-32 w-32 object-cover rounded mt-1" />}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload New Image (Optional)</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} className="border p-2 w-full rounded mt-1" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">Update Product</button>
      </form>
    </div>
  );
}

export default ProductUpdate;