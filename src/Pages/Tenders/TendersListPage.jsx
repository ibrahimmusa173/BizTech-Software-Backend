import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function TendersListPage() {
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        fetchTenders();
    }, []);

    const fetchTenders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/tenders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTenders(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching tenders:", err);
            setError(err.response?.data?.message || "Failed to fetch tenders.");
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        navigate('/login');
        alert('You have been logged out.');
    };

    if (loading) return <div className="container mx-auto p-4">Loading tenders...</div>;
    if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Available Tenders</h1>
                {currentUser ? (
                    <div className="flex items-center">
                        <span className="mr-4">Welcome, {currentUser.name} ({currentUser.user_type})</span>
                        <Link to="/profile" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Profile</Link>
                        {currentUser.user_type === 'client' && (
                            <Link to="/client/my-tenders" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2">My Tenders</Link>
                        )}
                        {currentUser.user_type === 'client' && (
                            <Link to="/create-tender" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">Create New Tender</Link>
                        )}
                        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
                    </div>
                ) : (
                    <div>
                        <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Login</Link>
                        <Link to="/register" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Register</Link>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenders.length > 0 ? (
                    tenders.map(tender => (
                        <div key={tender._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{tender.title}</h2>
                            <p className="text-gray-600 mb-4">{tender.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                <span>Status: <span className={`font-medium ${tender.status === 'open' ? 'text-green-600' : 'text-yellow-600'}`}>{tender.status}</span></span>
                                <span>Deadline: <span className="font-medium text-gray-700">{new Date(tender.deadline).toLocaleDateString()}</span></span>
                            </div>
                            <Link to={`/tenders/${tender._id}`} className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No tenders available at the moment.</p>
                )}
            </div>
        </div>
    );
}

export default TendersListPage;