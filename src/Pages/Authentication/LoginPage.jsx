import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            // Navigation happens inside the login function upon success
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full rounded" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full rounded" required />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">Login</button>
            </form>
            
            {/* --- LINK TO FORGOT PASSWORD (Added) --- */}
            <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
                    Forgot Password?
                </Link>
            </div>

            <div className="text-center mt-4">
                {/* Text corrected to use HTML entity for apostrophe */}
                <Link to="/register" className="text-blue-500 hover:underline">Dont have an account? Register</Link>
            </div>
        </div>
    );
}

export default LoginPage;