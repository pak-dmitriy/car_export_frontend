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

    return (
        <header>
            <nav>
                <Link to="/">{t('nav.home')}</Link>
                <Link to="/cars">{t('nav.catalogue')}</Link>
                {user ? (
                    <>
                        <Link to="/messages">{user.role === 'ADMIN' ? t('nav.inbox') : t('nav.messages')}</Link>
                        {user.role === 'ADMIN' && <Link to="/admin/cars">{t('nav.admin')}</Link>}
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
            </nav>
        </header>
    );
}