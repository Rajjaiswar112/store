import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const WishlistCtx = createContext(null);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [ids, setIds] = useState([]);
    const [products, setProducts] = useState([]);

    const refresh = useCallback(async () => {
        if (!user) {
            setIds([]);
            setProducts([]);
            return [];
        }
        try {
            const { data } = await api.get("/wishlist");
            const safeIds = data.products?.map(p => typeof p === 'object' ? (p._id || p.id) : p) || [];

            setIds(safeIds);
            setProducts(data.products || []);
            return safeIds;
        } catch (error) {
            setIds([]);
            return [];
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const toggle = async (pid) => {
        if (!user) return false;
        try {
            const isCurrentlyInWishlist = ids.some(id => String(id) === String(pid));

            if (isCurrentlyInWishlist) {
                await api.delete(`/wishlist/${pid}`);
            } else {
                await api.post("/wishlist", { product_id: pid });
            }

            const updatedIds = await refresh();
            return updatedIds.some(id => String(id) === String(pid));
        } catch (error) {
            throw error;
        }
    };

    const has = (pid) => ids.some(id => String(id) === String(pid));

    return (
        <WishlistCtx.Provider value={{ ids, products, toggle, has, refresh }}>
            {children}
        </WishlistCtx.Provider>
    );
}

export const useWishlist = () => useContext(WishlistCtx);