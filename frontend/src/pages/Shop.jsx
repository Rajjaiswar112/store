import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";

export default function Shop() {
    const [params] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const category = params.get("category") || "";
    const search = params.get("search") || "";

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams();
        if (category) q.set("category", category);
        if (search) q.set("search", search);
        q.set("limit", "100");
        api.get(`/products?${q.toString()}`).then(({ data }) => {
            setProducts(data);
        }).finally(() => setLoading(false));
    }, [category, search]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 20 } }
    };

    return (
        <main className="relative min-h-screen py-20 overflow-hidden flex justify-center">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.img
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop"
                    alt="Cyberpunk Background"
                    className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#0a0a0f]/80 to-[#050505]/95 backdrop-blur-[2px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-purple/10 via-transparent to-transparent opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-[1600px] px-6 sm:px-8 lg:px-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-40 flex flex-col items-center justify-center bg-[#0a0a0f]/40 backdrop-blur-xl rounded-2xl border border-white/5"
                    >
                        <div className="font-heading text-zinc-500 uppercase tracking-widest text-3xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">System Empty</div>
                        <Link to="/shop" className="mt-6 px-10 py-3 rounded-lg bg-white/5 hover:bg-neon-purple text-white font-heading uppercase tracking-widest text-sm transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(176,38,255,0.6)]">Reboot Search</Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
                    >
                        {products.map(p => (
                            <motion.div key={p.id} variants={itemVariants}>
                                <ProductCard product={p} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </main>
    );
}