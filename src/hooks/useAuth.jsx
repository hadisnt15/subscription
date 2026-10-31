import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchUser() {
        const token = localStorage.getItem('token');

        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }

        try {
            const response = await api.get('/me');
            const currentUser = response.data.user ?? response.data.data ?? response.data;
            setUser(currentUser);

            return currentUser;
        } catch {
            localStorage.removeItem('token');
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    async function login(email, password) {
        const response = await api.post('/login', {
            email, password,
        });

        localStorage.setItem('token', response.data.token);

        const currentUser = await fetchUser();

        if (!currentUser) {
            localStorage.removeItem('token');
            throw new Error('Failed to collect user data.');
        }

        return currentUser;
    }

    async function register(name, email, password, passwordConfirmation) {
        const response = await api.post('/register', {
            name, email, password, password_confirmation: passwordConfirmation,
        });

        return response.data;
    }

    async function logout() {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}