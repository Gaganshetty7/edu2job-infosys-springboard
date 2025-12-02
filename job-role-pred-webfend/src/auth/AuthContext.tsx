import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api, { attachToken } from "../api/axiosInstance";

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<{ok: boolean; msg: string;}>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Login function that sets user and access token
    const login = async (email: string, password: string) => {
        try {
            const res = await api.post("/auth/login/", { email, password });

            // Safe checks
            const token = res?.data?.access;
            const userData = res?.data?.user;

            if (!token || !userData) {
                return { ok: false, msg: "Server error. Try again." };
            }

            setAccessToken(token);
            setUser(userData);
            attachToken(token);

            return { ok: true, msg: "Login successful" };
        } catch (error: any) {
            return { ok: false, msg: "Login failed. Check connection or credentials." };
        }
    };


    const register = async (name: string, email: string, password: string) => {
        await api.post("/auth/register/", { name, email, password });
        await login(email, password);
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        attachToken(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, accessToken, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;
