import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        // Store the current URL before redirecting to login
        authService.setRedirectUrl(location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 