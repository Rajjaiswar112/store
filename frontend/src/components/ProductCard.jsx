import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { categoryName, formatPrice } from "../lib/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ProductCard({ product, compact = false }) {
    const { has, toggle } = useWishlist();
    const { add } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();
    const img = product.images?.[0] || "https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg";

    const onWishlist = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { nav("/login"); return; }
        try {
            const added = await toggle(product.id);
            toast.success(added ? "Added to wishlist" : "Removed from wishlist");
        } catch { toast.error("Wishlist failed"); }
    };
    const onAdd = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { nav("/login"); return; }
        try { await add(product.id, 1); toast.success(`${product.name} added to cart`); }
        catch { toast.error("Could not add to cart"); }
    };

    return (
        <Link to={`/product/${product.id}`} className="group block relative neon-border bg-[#0a0a0f]/60 product-card-frame" data-testid={`product-card-${product.id}`}>
            <div className={`relative ${compact ? 'aspect-square' : 'aspect-[3/4]'} overflow-hidden bg-black`}>
                <img src={img} alt={product.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />

                {/* badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {product.new_arrival && <span className="bg-neon-cyan/95 text-black px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold">New</span>}
                    {product.best_seller && <span className="bg-neon-magenta/95 text-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold">Best</span>}
                    {product.trending && <span className="bg-neon-purple/95 text-white px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold">Trending</span>}
                </div>

                <button onClick={onWishlist} className={`absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md border border-white/10 hover:border-neon-magenta z-10 transition-colors ${has(product.id) ? 'text-neon-magenta border-neon-magenta' : 'text-white'}`} data-testid={`wishlist-toggle-${product.id}`}>
                    <Heart className={`w-4 h-4 ${has(product.id) ? 'fill-current' : ''}`} strokeWidth={1.5} />
                </button>

                <button onClick={onAdd} className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-neon-purple/95 hover:bg-neon-purple text-white py-2 font-heading uppercase tracking-widest text-xs flex items-center justify-center gap-2" data-testid={`add-to-cart-${product.id}`}>
                    <ShoppingCart className="w-4 h-4" strokeWidth={1.5} /> Add to Cart
                </button>
            </div>

            <div className="p-4 space-y-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon-cyan">{categoryName(product.category)}</div>
                <div className="font-heading text-base uppercase tracking-tight text-white line-clamp-1">{product.name}</div>
                <div className="flex items-center justify-between pt-2">
                    <div className="font-mono text-lg text-white">{formatPrice(product.price)}</div>
                    {product.anime && <div className="text-xs text-zinc-500 font-body tracking-wider">{product.anime}</div>}
                </div>
            </div>
        </Link>
    );
}
