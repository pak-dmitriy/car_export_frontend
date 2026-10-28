import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <header>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/cars">Catalogue</Link>
                {user ? (
                    <>
                        {user.role === 'ADMIN' && <Link to="/admin/cars">Admin</Link>}
                        <span>{user.fullName}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}