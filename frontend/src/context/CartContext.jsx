import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) { setItems([]); return; }
        setLoading(true);
        try {
            const { data } = await api.get("/cart");
            setItems(data.items || []);
        } catch { setItems([]); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { refresh(); }, [refresh]);

    const add = async (product_id, quantity = 1) => {
        await api.post("/cart", { product_id, quantity });
        await refresh();
    };
    
    const update = async (product_id, quantity) => {
        await api.put(`/cart/${product_id}`, { product_id, quantity });
        await refresh();
    };
    
    const remove = async (product_id) => {
        await api.delete(`/cart/${product_id}`);
        await refresh();
    };
    
    const clear = async () => {
        await api.delete("/cart");
        await refresh();
    };

    const total = items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);
    const count = items.reduce((s, it) => s + it.quantity, 0);

    return (
        <CartCtx.Provider value={{ items, loading, total, count, add, update, remove, clear, refresh }}>
            {children}
        </CartCtx.Provider>
    );
}

export const useCart = () => useContext(CartCtx);