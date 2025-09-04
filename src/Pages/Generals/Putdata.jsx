// PutData.js - Create User Component (Updated)
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Userregistration() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  

  const createUser = async () => {
    // Basic validation
    if (!name || !username || !email) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Using the original endpoint from your code
      const response = await axios.post("http://localhost:7000/form1", {
        name,
        username,
        email
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert("New user added successfully");
        // Clear form
        setName('');
        setUsername('');
        setEmail('');
        // Optionally navigate back to user list
        // navigate('/getdata');
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to add user: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Link 
        className="font-bold text-3xl border border-black bg-yellow-400 p-2 mb-4 inline-block" 
        to="/getdata"
      >
        View Users
      </Link>

      <h1 className="text-2xl mb-4">Add New User</h1>
      
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full"
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <button 
          onClick={createUser}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>
    </div>
  );
}

export default Userregistration;