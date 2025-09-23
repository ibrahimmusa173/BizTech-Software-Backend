
import { Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types'; // Import PropTypes

// Helper function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000; // in seconds
        return decoded.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token:", error); // Log the error for debugging
        return true; // Malformed token or other error during decoding
    }
};

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let user = null;

    if (userString) {
        try {
            user = JSON.parse(userString);
        } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
            localStorage.removeItem('user'); // Clear corrupted data
            localStorage.removeItem('token');
            return <Navigate to="/login" />;
        }
    }

    if (!token || isTokenExpired(token) || !user) {
        // Redirect to login if not authenticated or token expired
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
        // Redirect to a forbidden page or home if not authorized
        return <Navigate to="/" />; // Or a specific '/forbidden' page
    }

    return children;
};

// Add propTypes for validation
PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired, // 'children' can be any renderable React node
    allowedRoles: PropTypes.arrayOf(PropTypes.string), // 'allowedRoles' is an array of strings
};

export default PrivateRoute;