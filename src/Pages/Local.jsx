// src/Pages/Local.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link and useNavigate

function Local() {
  
  const [userInfo, setUserInfo] = useState([]); // State to hold data from '/api/user' (now items)
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch from /api/items
      // CORRECTED: Changed endpoint from '/api/user' to '/api/items'
      const responseUserInfo = await axios.get('http://localhost:7000/api/items'); 
      setUserInfo(responseUserInfo.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to fetch data. Please check the server and database connection.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:7000/api/items/${id}`);
        alert("Item deleted successfully!");
        fetchData(); // Re-fetch data to update the list
      } catch (err) {
        console.error("Error deleting item:", err);
        alert(err.response?.data?.message || "Failed to delete item.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-item/${id}`); // Navigate to a new page for editing
  };

  if (loading) {
    return <div className="local-page-container">Loading data...</div>;
  }

  if (error) {
    return <div className="local-page-container" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      

      <h2 className="text-xl font-bold mb-2">Items from database endpoint:</h2> {/* Updated text for clarity */}
      <Link 
        to="/add-item" 
        className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add New Item
      </Link>
      {userInfo.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userInfo.map((item) => ( // Changed 'user' to 'item' for semantic clarity
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.id}</td>
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">{item.price}</td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      onClick={() => handleEdit(item.id)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No items available from the database.</p>
      )}
    </div>
  );
}

export default Local;