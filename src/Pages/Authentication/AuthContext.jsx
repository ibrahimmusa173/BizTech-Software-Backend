import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Create a configured axios instance for protected routes
const api = axios.create({
  baseURL: 'http://localhost:7000/api'
});

// Use an interceptor to automatically add the auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await axios.post('http://localhost:7000/api/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setToken(response.data.token);
        setUser(response.data.user);
        navigate('/DataFetch'); // Navigate to user list after login
        return response.data;
    };

    const register = async (userData) => {
        return await axios.post('http://localhost:7000/api/auth/register', userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    // --- ADDED PASSWORD RESET FUNCTIONS ---
    const forgotPassword = async (email) => {
        // This is a public endpoint, so we can use the global axios
        return await axios.post('http://localhost:7000/api/auth/forgot-password', { email });
    };

    const resetPassword = async (token, password) => {
        // This is also a public endpoint
        return await axios.post(`http://localhost:7000/api/auth/reset-password/${token}`, { password });
    };
    
    // Add the new functions to the 'value' object
    const value = { 
        user, 
        token, 
        isAuthenticated: !!token, 
        login, 
        logout, 
        register, 
        api,
        forgotPassword, // <-- ADDED
        resetPassword   // <-- ADDED
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};