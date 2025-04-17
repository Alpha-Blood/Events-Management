import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const access_token = searchParams.get('access_token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');
    const from = searchParams.get('from');

    useEffect(() => {
        console.log('OAuthCallback mounted');
        console.log('Params:', { access_token, userParam, error, from });

        if (error) {
            console.error('OAuth Error:', error);
            navigate('/login', { state: { error }, replace: true });
            return;
        }

        if (!access_token || !userParam) {
            console.error('Missing required parameters:', { access_token, userParam });
            navigate('/login', { state: { error: 'Authentication failed: Missing required parameters' }, replace: true });
            return;
        }

        try {
            const user = JSON.parse(decodeURIComponent(userParam));
            console.log('Successfully parsed user:', user);
            
            // Store auth data
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update auth context
            login(user);
            
            // Get redirect URL from authService
            const redirectUrl = authService.getRedirectUrl();
            console.log('Redirecting to:', redirectUrl);
            navigate(redirectUrl, { replace: true });
        } catch (e) {
            console.error('Error parsing user info:', e);
            navigate('/login', { state: { error: 'Failed to parse user information' }, replace: true });
        }
    }, []); // Empty dependency array since we only want this to run once

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;