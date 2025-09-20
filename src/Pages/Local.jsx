// src/Pages/Local.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link and useNavigate

function Local() {
  const [data, setData] = useState([]); // State to hold data from '/data'
  const [userInfo, setUserInfo] = useState([]); // State to hold data from '/api/user' (now items)
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Fetch from /data
      const responseData = await axios.get('http://localhost:7000/data');
      setData(responseData.data);

      // Fetch from /api/user (which now represents 'items')
      const responseUserInfo = await axios.get('http://localhost:7000/api/user');
      setUserInfo(responseUserInfo.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please check the server and database connection.");
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
      <p className="text-xl font-semibold mb-4">Hi, this is the local page</p>

      <h2 className="text-xl font-bold mb-2">Data from `/data` endpoint:</h2>
      {data.length > 0 ? (
        <ul className="list-disc list-inside mb-6">
          {data.map((item, index) => (
            <li key={index}>Name: {item.name}, Age: {item.age}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-6">No data available from `/data`.</p>
      )}

      <h2 className="text-xl font-bold mb-2">Items from `/api/user` (database) endpoint:</h2>
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
                <th className="py-2 px-4 border-b">Description</th> {/* Add this */}
                <th className="py-2 px-4 border-b">Price</th>       {/* Add this */}
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userInfo.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.description}</td> {/* Adjust these based on your 'items' table columns */}
                  <td className="py-2 px-4 border-b">{user.price}</td>       {/* Adjust these based on your 'items' table columns */}
                  <td className="py-2 px-4 border-b">
                    <button 
                      onClick={() => handleEdit(user.id)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
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