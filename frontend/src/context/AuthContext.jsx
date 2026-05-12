import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);  // null = checking, false = logged out, object = logged in
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!getToken()) { setUser(false); setLoading(false); return; }
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            setToken(null);
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        if (data.access_token) setToken(data.access_token);
        setUser(data);
        return data;
    };
    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        if (data.access_token) setToken(data.access_token);
        setUser(data);
        return data;
    };
    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        setToken(null);
        setUser(false);
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);
