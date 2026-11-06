import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(user.role)) {
        return <p style={{ color: 'red' }}>{t('protectedRoute.denied')}</p>;
    }

    return children;
}