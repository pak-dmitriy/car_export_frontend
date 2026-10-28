import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
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
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input placeholder="Full name" required minLength={2} maxLength={100}
                       value={fullName} onChange={(e) => setFullName(e.target.value)} />
                {fieldErrors.fullName && <p style={{ color: 'red' }}>{fieldErrors.fullName}</p>}

                <input type="email" placeholder="Email" required
                       value={email} onChange={(e) => setEmail(e.target.value)} />
                {fieldErrors.email && <p style={{ color: 'red' }}>{fieldErrors.email}</p>}

                <input type="password" placeholder="Password (min 8 characters)" required minLength={8}
                       value={password} onChange={(e) => setPassword(e.target.value)} />
                {fieldErrors.password && <p style={{ color: 'red' }}>{fieldErrors.password}</p>}

                {error && !Object.keys(fieldErrors).length && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Register'}
                </button>
            </form>
        </div>
    );
}