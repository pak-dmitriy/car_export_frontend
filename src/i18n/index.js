import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ru from './ru.json';
import enProfile from './profile.en.json';
import ruProfile from './profile.ru.json';

export const LANGUAGES = ['en', 'ru'];

const saved = localStorage.getItem('language');

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: { ...en, ...enProfile } },
        ru: { translation: { ...ru, ...ruProfile } },
    },
    lng: LANGUAGES.includes(saved) ? saved : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

export default i18n;