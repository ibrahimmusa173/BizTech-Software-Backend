// src/Pages/Auth/LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:7000/api/auth/login', {
        email,
        password,
      });
      // Store the token (e.g., in localStorage)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user info

      setMessage(response.data.message || 'Login successful!');
      setTimeout(() => {
        // Redirect based on user type or to a dashboard
        if (response.data.user.user_type === 'admin') {
          navigate('/admin/dashboard'); // Example admin dashboard
        } else {
          navigate('/'); // Redirect to home/tenders list
        }
      }, 1000);
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.response?.data?.message || 'Login failed. Invalid email or password.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login to BizTech Tenders</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Login
          </button>
          <Link
            to="/forgot-password"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
      {message && <p className="text-green-500 text-sm italic mt-2 text-center">{message}</p>}
      {error && <p className="text-red-500 text-sm italic mt-2 text-center">{error}</p>}
      <p className="text-center text-gray-600 text-xs mt-4">
        Dont have an account? <Link to="/register" className="text-blue-500 hover:text-blue-800">Register here</Link>.
      </p>
    </div>
  );
}

export default LoginPage;