import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);
        try {
            await register(fullName, email, password);
            navigate('/cars');
        } catch (err) {
            setError(err.message);
            setFieldErrors(err.fieldErrors || {});
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>{t('auth.registerTitle')}</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder={t('auth.fullName')} required minLength={2} maxLength={100}
                       value={fullName} onChange={(e) => setFullName(e.target.value)} />
                {fieldErrors.fullName && <p style={{ color: 'red' }}>{fieldErrors.fullName}</p>}

                <input type="email" placeholder={t('auth.email')} required
                       value={email} onChange={(e) => setEmail(e.target.value)} />
                {fieldErrors.email && <p style={{ color: 'red' }}>{fieldErrors.email}</p>}

                <input type="password" placeholder={t('auth.passwordHint')} required minLength={8}
                       value={password} onChange={(e) => setPassword(e.target.value)} />
                {fieldErrors.password && <p style={{ color: 'red' }}>{fieldErrors.password}</p>}

                {error && !Object.keys(fieldErrors).length && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? t('common.loading') : t('auth.registerButton')}
                </button>
            </form>
        </div>
    );
}