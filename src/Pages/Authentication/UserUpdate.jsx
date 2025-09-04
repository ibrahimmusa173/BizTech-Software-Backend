import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Import useAuth

function UserUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth(); // Get the authenticated api instance

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`) // Use 'api' instance
      .then(response => {
        const user = response.data;
        setName(user.name);
        setUsername(user.username);
        setEmail(user.email);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        alert("Could not fetch user data.");
        setLoading(false);
      });
  }, [id, api]); 

  const updateUser = async (e) => {
    e.preventDefault();
    if (!name || !username || !email) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await api.put(`/users/${id}`, { name, username, email }); // Use 'api' instance
      alert("User updated successfully");
      navigate("/DataFetch");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Link className="font-bold text-xl border border-black bg-yellow-400 px-4 py-2 mb-4 inline-block rounded" to="/DataFetch">
        Back to Users
      </Link>
      <h1 className="text-2xl mb-4">Edit User</h1>
      <form onSubmit={updateUser} className="space-y-4">
        {/* Form inputs remain the same */}
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full rounded"/>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2 w-full rounded"/>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full rounded"/>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Update User
        </button>
      </form>
    </div>
  );
}

export default UserUpdate;