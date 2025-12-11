// src/auth/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axiosInstance";
import axios from "axios";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; msg: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ ok: boolean; msg: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; msg: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access")
  );

  // Attach token automatically to axios
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/accounts/login/", { email, password });

      // DRF returns user info + access + refresh
      const { access, refresh, user_id, name, role, email: userEmail } = res.data;

      const userData: User = {
        id: user_id,
        name,
        email: userEmail,
        role,
      };

      setUser(userData);
      setAccessToken(access);

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      return { ok: true, msg: "Login successful" };
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      return { ok: false, msg: "Invalid email or password" };
    }
  };


  // ---------------------------
  // GOOGLE LOGIN (NEW)
  // ---------------------------

  const loginWithGoogle = async (
    idToken: string
  ): Promise<{ ok: boolean; msg: string }> => {
    try {
      const res = await api.post("/accounts/google-login/", { token: idToken });
      const { user, access, refresh } = res.data;

      setUser(user);
      setAccessToken(access);

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      return { ok: true, msg: "Login successful" }; // ✅ always include msg
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log(err);
      }
      return { ok: false, msg: "Google login failed" }; // ✅ always include msg
    }
  };


  // ---------------------------
  // REGISTER
  // ---------------------------
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/accounts/register/", {
        name,
        email,
        password,
      });

      const { user, access, refresh } = res.data;

      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      setUser(userData);
      setAccessToken(access);

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      return { ok: true, msg: "Account created successfully" };
    } catch (err) {
      return { ok: false, msg: "Registration failed. Email may already exist." };
    }
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  // ---------------------------
  // LOAD USER FROM LOCAL STORAGE ON REFRESH
  // ---------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
