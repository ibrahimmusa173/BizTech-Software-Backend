import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types'; // FIX 2: Import PropTypes
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// FIX 2: Add prop-types validation for the 'children' prop
PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;