import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role)) {
        return <p style={{ color: 'red' }}>Access denied</p>;
    }

    return children;
}