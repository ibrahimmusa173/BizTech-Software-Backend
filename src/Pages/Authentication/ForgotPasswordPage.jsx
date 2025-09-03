// src/Pages/Authentication/ForgotPasswordPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await forgotPassword(email);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
            <p className="text-center text-gray-600 mb-4">Enter your email address and we will send you a link to reset your password.</p>
            {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="email" 
                    placeholder="Your Email Address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="border p-2 w-full rounded" 
                    required 
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
                    Send Reset Link
                </button>
            </form>
            <div className="text-center mt-4">
                <Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;