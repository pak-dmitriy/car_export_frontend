import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    function handleChange(e) {
        const language = e.target.value;
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
    }

    return (
        <select value={i18n.language} onChange={handleChange} aria-label="Language">
            {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
        </select>
    );
}