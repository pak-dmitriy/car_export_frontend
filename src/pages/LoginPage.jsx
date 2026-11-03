import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/cars');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>{t('auth.loginTitle')}</h1>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder={t('auth.email')} required
                       value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder={t('auth.password')} required
                       value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? t('common.loading') : t('auth.loginButton')}
                </button>
            </form>
        </div>
    );
}