import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BASE}/api`;

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

export const CATEGORIES = [
    { slug: "acrylic_plaques", name: "Acrylic Plaques" },
    { slug: "led_frames", name: "LED Frames" },
    { slug: "posters", name: "Posters" },
    { slug: "manga_canvas", name: "Manga Canvas" },
    { slug: "neon_collectibles", name: "Neon Collectibles" },
];

export function categoryName(slug) {
    return CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}

export function formatPrice(n) {
    return `$${Number(n).toFixed(2)}`;
}

export function errMsg(e) {
    const d = e?.response?.data?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(", ");
    if (d?.msg) return d.msg;
    return e?.message || "Something went wrong";
}
