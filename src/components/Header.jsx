import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    const isAdmin = user?.role === 'ADMIN';

    return (
        <header className="site-header">
            <nav className="nav">
                <div className="nav-links">
                    <Link to="/">{t('nav.home')}</Link>
                    <Link to="/cars">{t('nav.catalogue')}</Link>
                    {user && <Link to="/messages">{isAdmin ? t('nav.inbox') : t('nav.messages')}</Link>}
                    {isAdmin && <Link to="/admin">{t('admin.navDashboard')}</Link>}
                    {isAdmin && <Link to="/admin/cars">{t('nav.admin')}</Link>}
                    {isAdmin && <Link to="/admin/users">{t('admin.navUsers')}</Link>}
                </div>

                <div className="nav-user">
                    {user ? (
                        <>
                            <Link to="/profile">{user.fullName}</Link>
                            <button onClick={handleLogout}>{t('nav.logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">{t('nav.login')}</Link>
                            <Link to="/register">{t('nav.register')}</Link>
                        </>
                    )}
                    <LanguageSwitcher />
                </div>
            </nav>
        </header>
    );
}