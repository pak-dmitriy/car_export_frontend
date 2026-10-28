import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });

    function saveSession(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
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
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}