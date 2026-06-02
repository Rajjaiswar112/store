import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { formatPrice, categoryName } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function FeaturedProduct({ product }) {
    const { has, toggle } = useWishlist();
    const { add } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();
    
    const pid = product?._id || product?.id;
    const img = product?.image || product?.images?.[0] || "https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg";

    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
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
            const added = await toggle(pid);
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
            await add(pid, 1); 
            toast.success(`${product.name} added to cart`); 
        } catch { 
            toast.error("Could not add to cart"); 
        }
    };

    if (!product) return null;

    return (
        <div className="w-full relative group perspective-1000 my-8">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/20 via-[#06B6D4]/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <Link 
                to={`/product/${pid}`}
                className="relative flex flex-col md:flex-row bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:border-[#7C3AED]/50 transition-colors duration-500"
            >
                {/* Visual Side (Left) */}
                <motion.div 
                    ref={ref}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    className="w-full md:w-1/2 relative h-[400px] md:h-[500px] overflow-hidden bg-black p-4"
                >
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none" />
                    
                    <motion.img 
                        src={img} 
                        alt={product.name}
                        style={{ transform: "translateZ(50px)" }}
                        className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    {/* Elite Badge */}
                    <div className="absolute top-8 left-8 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-[#06B6D4]/50 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)]" style={{ transform: "translateZ(70px)" }}>
                        <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                        <span className="font-mono text-xs uppercase tracking-widest text-[#06B6D4] font-bold">Premium Tier</span>
                    </div>
                </motion.div>

                {/* Data Side (Right) */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-20">
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#7C3AED] font-bold flex items-center gap-2">
                                    <Zap className="w-4 h-4 fill-current" /> {categoryName(product.category)}
                                </span>
                                {product.anime && <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{product.anime}</span>}
                            </div>
                            
                            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 mb-2">
                                {product.name}
                            </h2>
                            
                            <div className="font-mono text-4xl text-[#06B6D4] font-bold drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                {formatPrice(product.price)}
                            </div>
                        </div>

                        <p className="text-zinc-400 font-body text-sm leading-relaxed max-w-md line-clamp-3">
                            {product.description || "Experience the pinnacle of our collection. This ultra-premium acrylic plaque features flawless edge-to-edge printing, stunning depth, and cinematic color grading designed for the true collector."}
                        </p>

                        <div className="flex items-center gap-4 pt-6">
                            <button 
                                onClick={onAdd} 
                                className="flex-1 bg-white hover:bg-zinc-200 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                <ShoppingCart className="w-5 h-5" /> Secure Item
                            </button>
                            
                            <button 
                                onClick={onWishlist} 
                                className={`p-4 rounded-xl border transition-all duration-300 bg-black/40 backdrop-blur-md ${has(pid) ? 'border-[#EC4899] text-[#EC4899] shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-white/10 text-white hover:border-[#EC4899] hover:text-[#EC4899]'}`}
                            >
                                <Heart className={`w-6 h-6 ${has(pid) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}