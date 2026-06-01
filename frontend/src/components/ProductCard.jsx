import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { categoryName, formatPrice } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ProductCard({ product, compact = false }) {
    const { has, toggle } = useWishlist();
    const { add } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();
    
    const productId = product._id || product.id;
    const img = product.image || product.images?.[0] || "https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg";

    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const onWishlist = async (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (!user) { nav("/login"); return; }
        try {
            const added = await toggle(productId);
            toast.success(added ? "Added to wishlist" : "Removed from wishlist");
        } catch { 
            toast.error("Wishlist failed"); 
        }
    };
    
    const onAdd = async (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (!user) { nav("/login"); return; }
        try { 
            await add(productId, 1); 
            toast.success(`${product.name} added to cart`); 
        } catch { 
            toast.error("Could not add to cart"); 
        }
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="perspective-1000 w-full h-full"
        >
            <Link 
                to={`/product/${productId}`} 
                className="group block relative bg-[#0a0a0f]/80 rounded-xl overflow-hidden backdrop-blur-xl border border-white/5 hover:border-[#06B6D4]/50 transition-colors duration-300" 
                style={{ transform: "translateZ(30px)" }}
            >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl bg-[#06B6D4]/20" />
                
                <div className={`relative ${compact ? 'aspect-square' : 'aspect-[3/4]'} overflow-hidden bg-black rounded-t-xl`} style={{ transform: "translateZ(40px)" }}>
                    <img 
                        src={img} 
                        alt={product.name} 
                        loading="lazy" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10" style={{ transform: "translateZ(50px)" }}>
                        {product.new_arrival && <span className="bg-[#06B6D4] text-black px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm shadow-[0_0_10px_rgba(6,182,212,0.5)]">New</span>}
                        {product.best_seller && <span className="bg-[#EC4899] text-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm shadow-[0_0_10px_rgba(236,72,153,0.5)]">Best</span>}
                        {product.trending && <span className="bg-[#7C3AED] text-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm shadow-[0_0_10px_rgba(124,58,237,0.5)]">Trending</span>}
                    </div>

                    <button 
                        onClick={onWishlist} 
                        className={`absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#EC4899] hover:bg-[#EC4899]/20 z-10 transition-all duration-300 ${has(productId) ? 'text-[#EC4899] border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'text-white'}`}
                        style={{ transform: "translateZ(60px)" }}
                    >
                        <Heart className={`w-4 h-4 ${has(productId) ? 'fill-current' : ''}`} strokeWidth={1.5} />
                    </button>

                    <button 
                        onClick={onAdd} 
                        className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 rounded-lg font-heading uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.6)]"
                        style={{ transform: "translateZ(60px)" }}
                    >
                        <ShoppingCart className="w-4 h-4" strokeWidth={2} /> Add to Cart
                    </button>
                </div>

                <div className="p-5 space-y-2" style={{ transform: "translateZ(30px)" }}>
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#06B6D4]">{categoryName(product.category)}</div>
                    <div className="font-heading text-lg uppercase tracking-tight text-white line-clamp-1">{product.name}</div>
                    <div className="flex items-center justify-between pt-1">
                        <div className="font-mono text-xl text-white font-bold">{formatPrice(product.price)}</div>
                        {product.anime && <div className="text-xs text-zinc-400 font-body tracking-wider">{product.anime}</div>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}