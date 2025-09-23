// src/Pages/Auth/ResetPasswordPage.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Assuming you'll use axios directly

function ResetPasswordPage() {
    const { token } = useParams(); // Gets the token from the URL
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) { // Client-side validation for password length
            setError("Password must be at least 6 characters long.");
            return;
        }

        setError('');
        setMessage('');

        try {
            // Adjust the API endpoint if different
            const response = await axios.post(`http://localhost:7000/api/auth/reset-password/${token}`, { newPassword: password });
            setMessage(response.data.message + " Redirecting to login...");
            setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be invalid or expired.');
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Reset Your Password</h1>
            {message && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</p>}
            {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
            {!message && ( // Hide form after successful submission
                <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 focus:outline-none focus:shadow-outline">
                        Update Password
                    </button>
                </form>
            )}
             {message && (
                <div className="text-center mt-4">
                    <Link to="/login" className="text-blue-500 hover:underline">Go to Login Now</Link>
                </div>
            )}
        </div>
    );
}

export default ResetPasswordPage;