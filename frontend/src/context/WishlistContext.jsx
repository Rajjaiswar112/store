import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const WishlistCtx = createContext(null);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [ids, setIds] = useState([]);
    const [products, setProducts] = useState([]);

    const refresh = useCallback(async () => {
        if (!user) { setIds([]); setProducts([]); return; }
        try {
            const { data } = await api.get("/wishlist");
            setIds(data.product_ids || []);
            setProducts(data.products || []);
        } catch { setIds([]); }
    }, [user]);

    useEffect(() => { refresh(); }, [refresh]);

    const toggle = async (pid) => {
        const { data } = await api.post(`/wishlist/${pid}`);
        await refresh();
        return data.added;
    };
    const has = (pid) => ids.includes(pid);

    return (
        <WishlistCtx.Provider value={{ ids, products, toggle, has, refresh }}>
            {children}
        </WishlistCtx.Provider>
    );
}

export const useWishlist = () => useContext(WishlistCtx);
