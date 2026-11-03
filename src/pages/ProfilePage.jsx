import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../i18n';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const { t, i18n } = useTranslation();

    const [fullName, setFullName] = useState(user.fullName);
    const [language, setLanguage] = useState(
        LANGUAGES.includes(user.preferredLanguage) ? user.preferredLanguage : i18n.language,
    );
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaved(false);

        const name = fullName.trim();
        if (name.length < 2 || name.length > 100) {
            setErrors({ fullName: t('profile.errName') });
            return;
        }
        setErrors({});

        setSubmitting(true);
        try {
            const updated = await apiRequest('/api/users/me', {
                method: 'PUT',
                body: { fullName: name, preferredLanguage: language },
            });
            updateUser(updated);
            i18n.changeLanguage(language);
            localStorage.setItem('language', language);
            setFullName(updated.fullName);
            setSaved(true);
        } catch (err) {
            setError(err.message);
            setErrors(err.fieldErrors || {});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h1>{t('profile.title')}</h1>

            <form onSubmit={handleSubmit} noValidate className="car-form">
                <label className="form-field">
                    {t('profile.email')}
                    <input value={user.email} disabled />
                </label>

                <label className="form-field">
                    {t('profile.role')}
                    <input value={t(`profile.roleNames.${user.role}`, { defaultValue: user.role })} disabled />
                </label>

                <label className="form-field">
                    {t('profile.fullName')}
                    <input value={fullName} onChange={(e) => { setFullName(e.target.value); setSaved(false); }} />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </label>

                <label className="form-field">
                    {t('profile.language')}
                    <select value={language} onChange={(e) => { setLanguage(e.target.value); setSaved(false); }}>
                        {LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l.toUpperCase()}</option>
                        ))}
                    </select>
                    {errors.preferredLanguage && <span className="field-error">{errors.preferredLanguage}</span>}
                </label>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {saved && <p style={{ color: 'green' }}>{t('profile.saved')}</p>}

                <button type="submit" disabled={submitting}>
                    {submitting ? t('profile.saving') : t('profile.save')}
                </button>
            </form>
        </div>
    );
}