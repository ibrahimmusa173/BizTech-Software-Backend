import { useState } from 'react'; // FIX: 'React' was removed as it's not used
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formData.password.length < 6) {
             setError('Password must be at least 6 characters long.');
             return;
        }
        try {
            await register(formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            {success && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="border p-2 w-full rounded" required />
                <input type="text" name="username" placeholder="Username" onChange={handleChange} className="border p-2 w-full rounded" required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full rounded" required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full rounded" required />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600">Register</button>
            </form>
            <div className="text-center mt-4">
                <Link to="/login" className="text-blue-500 hover:underline">Already have an account? Login</Link>
            </div>
        </div>
    );
}
export default RegisterPage;