import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutCallbackPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login or home page after logout callback
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>Logging out...</p>
        </div>
    );
};

export { LogoutCallbackPage };