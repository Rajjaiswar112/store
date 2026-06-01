import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const API_BASE = `${BASE}/api`;

console.log("Current BASE URL is:", BASE);

export const api = axios.create({ baseURL: API_BASE });

const TOKEN_KEY = "zenkai_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
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

export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(price);
};

export function errMsg(e) {
    const d = e?.response?.data?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(", ");
    if (d?.msg) return d.msg;
    return e?.message || "Something went wrong";
}