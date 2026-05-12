import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, categoryName, formatPrice, errMsg } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { Heart, ShoppingCart, Plus, Minus, ChevronRight, Zap, Truck, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [p, setP] = useState(null);
    const [qty, setQty] = useState(1);
    const [related, setRelated] = useState([]);
    const { add } = useCart();
    const { has, toggle } = useWishlist();
    const { user } = useAuth();

    useEffect(() => {
        api.get(`/products/${id}`).then(({ data }) => {
            setP(data);
            api.get(`/products?category=${data.category}&limit=8`).then(r => setRelated(r.data.filter(x => x.id !== data.id).slice(0, 4)));
        }).catch(() => nav("/shop"));
        setQty(1);
    }, [id, nav]);

    if (!p) return <div className="min-h-screen flex items-center justify-center font-heading text-neon-purple uppercase tracking-widest">Loading...</div>;

    const onAdd = async () => {
        if (!user) return nav("/login");
        try { await add(p.id, qty); toast.success(`${p.name} added to cart (x${qty})`); }
        catch (e) { toast.error(errMsg(e)); }
    };
    const onWish = async () => {
        if (!user) return nav("/login");
        try { const a = await toggle(p.id); toast.success(a ? "Added to wishlist" : "Removed from wishlist"); }
        catch (e) { toast.error(errMsg(e)); }
    };

    return (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="product-detail">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 mb-8">
                <Link to="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/shop" className="hover:text-white">Shop</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/shop?category=${p.category}`} className="hover:text-white">{categoryName(p.category)}</Link>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image */}
                <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 blur-2xl" />
                    <div className="relative aspect-[4/5] bg-black overflow-hidden neon-border">
                        <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" data-testid="product-image" />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {p.new_arrival && <span className="bg-neon-cyan text-black px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-bold">New</span>}
                            {p.best_seller && <span className="bg-neon-magenta text-white px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest font-bold">Best Seller</span>}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                    <div>
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2" data-testid="product-category">{categoryName(p.category)}</div>
                        <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white mb-3" data-testid="product-name">{p.name}</h1>
                        {p.anime && <div className="font-body text-zinc-400 text-sm uppercase tracking-widest">// {p.anime}</div>}
                    </div>

                    <div className="flex items-baseline gap-4 border-y border-white/5 py-5">
                        <div className="font-mono text-4xl text-neon-purple" data-testid="product-price">{formatPrice(p.price)}</div>
                        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                            {p.stock > 0 ? <span className="text-neon-cyan">// in stock — {p.stock} units</span> : <span className="text-neon-magenta">// out of stock</span>}
                        </div>
                    </div>

                    <p className="text-zinc-300 leading-relaxed font-body" data-testid="product-description">{p.description}</p>

                    {/* Quantity */}
                    <div className="space-y-3 pt-2">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Quantity</div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 border border-white/10 hover:border-neon-purple flex items-center justify-center" data-testid="qty-minus">
                                <Minus className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <div className="font-mono text-xl text-white w-14 text-center" data-testid="qty-display">{qty}</div>
                            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 border border-white/10 hover:border-neon-purple flex items-center justify-center" data-testid="qty-plus">
                                <Plus className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <button onClick={onAdd} disabled={p.stock <= 0} className="btn-neon flex-1 flex items-center justify-center gap-2" data-testid="add-cart-btn">
                            <ShoppingCart className="w-4 h-4" strokeWidth={1.5} /> Add to Cart
                        </button>
                        <button onClick={onWish} className={`btn-neon-cyan flex items-center justify-center gap-2 ${has(p.id) ? '!border-neon-magenta !text-neon-magenta' : ''}`} data-testid="wishlist-btn">
                            <Heart className={`w-4 h-4 ${has(p.id) ? 'fill-current' : ''}`} strokeWidth={1.5} /> {has(p.id) ? 'Saved' : 'Wishlist'}
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
                        <div className="text-center p-3 glass">
                            <Truck className="w-5 h-5 mx-auto text-neon-cyan mb-2" strokeWidth={1.5} />
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Free Ship $99+</div>
                        </div>
                        <div className="text-center p-3 glass">
                            <Shield className="w-5 h-5 mx-auto text-neon-purple mb-2" strokeWidth={1.5} />
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Authentic</div>
                        </div>
                        <div className="text-center p-3 glass">
                            <Sparkles className="w-5 h-5 mx-auto text-neon-magenta mb-2" strokeWidth={1.5} />
                            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Limited</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <section className="mt-20 pt-10 border-t border-white/5">
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">// related_items</div>
                    <h2 className="font-heading text-3xl uppercase tracking-tight text-white mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {related.map(r => <ProductCard key={r.id} product={r} />)}
                    </div>
                </section>
            )}
        </main>
    );
}
