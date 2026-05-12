import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);  // null = unknown, false = logged out, object = logged in
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        setUser(data);
        return data;
    };
    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        setUser(data);
        return data;
    };
    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        setUser(false);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);
