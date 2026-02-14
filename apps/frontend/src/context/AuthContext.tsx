'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    fullName: string;
    tenantId: string;
    roles: string[];
    plan?: {
        name: string;
        maxRooms: number;
        maxStaff: number;
        allowFinance: boolean;
        allowExport: boolean;
        allowMultiBranch: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (data: { email: string; pass: string; fullName: string; phone: string; kostName: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const res = await fetchApi('/auth/profile');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            const res = await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password: pass }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            toast.success('Login Berhasil!');

            // Fetch full profile to get Plan info
            await fetchProfile();

            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
            throw error;
        }
    };

    const register = async (data: { email: string; pass: string; fullName: string; phone: string; kostName: string }) => {
        setIsLoading(true);
        try {
            const res = await fetchApi('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: data.email,
                    password: data.pass,
                    fullName: data.fullName,
                    phone: data.phone,
                    kostName: data.kostName
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Registration failed');
            }

            const resData = await res.json();
            localStorage.setItem('access_token', resData.access_token);
            toast.success('Registrasi Berhasil!');

            await fetchProfile();
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
