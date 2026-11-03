import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../api/client';
import i18n, { LANGUAGES } from '../i18n';

const AuthContext = createContext(null);

function applyLanguage(language) {
    if (language && LANGUAGES.includes(language)) {
        i18n.changeLanguage(language);
        localStorage.setItem('language', language);
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });

    function updateUser(updated) {
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    }

    function saveSession(data) {
        localStorage.setItem('token', data.token);
        updateUser(data.user);
        applyLanguage(data.user.preferredLanguage);
    }

    async function login(email, password) {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: { email, password },
        });
        saveSession(data);
    }

    async function register(fullName, email, password) {
        const data = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: { fullName, email, password },
        });
        saveSession(data);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}