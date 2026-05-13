import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { api, formatPrice } from "../lib/api";
import { Link } from "react-router-dom";
import { Package, Heart, User, Mail, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Profile() {
    const { user } = useAuth();
    const { products: wishlist } = useWishlist();
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState("orders");

    useEffect(() => {
        api.get("/orders").then(({ data }) => setOrders(data)).catch(() => {});
    }, []);

    return (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="profile-page">
            <div className="mb-10 pb-6 border-b border-white/5">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">// user_console</div>
                <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white">My Account</h1>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-3">
                    <div className="glass p-6">
                        <div className="w-16 h-16 bg-neon-purple/20 border border-neon-purple flex items-center justify-center mb-4">
                            <User className="w-7 h-7 text-neon-purple" strokeWidth={1.5} />
                        </div>
                        <div className="font-heading text-xl uppercase tracking-tight text-white" data-testid="profile-name">{user?.name}</div>
                        <div className="font-mono text-xs text-zinc-400 flex items-center gap-1 mt-1" data-testid="profile-email">
                            <Mail className="w-3 h-3" strokeWidth={1.5} />
                            {user?.email}
                        </div>
                        <div className="mt-2 inline-block px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">{user?.role}</div>
                    </div>

                    <nav className="mt-4 glass p-2">
                        <button onClick={() => setTab("orders")} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-heading uppercase tracking-widest ${tab === "orders" ? "text-neon-purple bg-white/5" : "text-zinc-400 hover:text-white"}`} data-testid="tab-orders">
                            <span className="flex items-center gap-2"><Package className="w-4 h-4" strokeWidth={1.5} /> Orders</span>
                            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setTab("wishlist")} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-heading uppercase tracking-widest ${tab === "wishlist" ? "text-neon-purple bg-white/5" : "text-zinc-400 hover:text-white"}`} data-testid="tab-wishlist">
                            <span className="flex items-center gap-2"><Heart className="w-4 h-4" strokeWidth={1.5} /> Wishlist</span>
                            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </nav>
                </aside>

                <section className="lg:col-span-9">
                    {tab === "orders" && (
                        <div className="space-y-3" data-testid="orders-panel">
                            <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-4">Order History</h2>
                            {orders.length === 0 ? (
                                <div className="glass p-10 text-center">
                                    <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" strokeWidth={1.5} />
                                    <div className="font-heading uppercase tracking-widest text-zinc-500 text-sm">No orders yet</div>
                                    <Link to="/shop" className="inline-block mt-4 btn-neon">Start shopping</Link>
                                </div>
                            ) : orders.map(o => (
                                <div key={o.id} className="glass p-5 flex items-center justify-between gap-4" data-testid={`order-${o.id}`}>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">// {o.id.slice(0, 8)}</div>
                                        <div className="font-heading text-sm uppercase tracking-tight text-white truncate">{(o.summary || []).join(" / ") || `${(o.items || []).length} items`}</div>
                                        <div className="font-mono text-xs text-zinc-400 mt-1">{new Date(o.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-lg text-neon-purple">{formatPrice(o.amount)}</div>
                                        <div className="inline-block mt-1 px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">{o.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "wishlist" && (
                        <div data-testid="wishlist-panel">
                            <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-6">Wishlist</h2>
                            {wishlist.length === 0 ? (
                                <div className="glass p-10 text-center">
                                    <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-3" strokeWidth={1.5} />
                                    <div className="font-heading uppercase tracking-widest text-zinc-500 text-sm">No saved items</div>
                                    <Link to="/shop" className="inline-block mt-4 btn-neon">Explore products</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                                    {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
