import { useTranslation } from 'react-i18next';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../i18n';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { user, updateUser } = useAuth();

    async function handleChange(e) {
        const language = e.target.value;
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);

        if (user) {
            try {
                const updated = await apiRequest('/api/users/me', {
                    method: 'PUT',
                    body: { fullName: user.fullName, preferredLanguage: language },
                });
                updateUser(updated);
            } catch {
                return;
            }
        }
    }

    return (
        <select value={i18n.language} onChange={handleChange} aria-label="Language">
            {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
        </select>
    );
}