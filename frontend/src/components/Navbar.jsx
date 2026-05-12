import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Zap, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../lib/api";

export default function Navbar({ onCartOpen }) {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [userMenu, setUserMenu] = useState(false);

    const submitSearch = (e) => {
        e.preventDefault();
        if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/5" data-testid="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
                        <div className="relative">
                            <Zap className="w-7 h-7 text-neon-purple group-hover:text-neon-cyan transition-colors" strokeWidth={1.5} />
                            <div className="absolute inset-0 bg-neon-purple/30 blur-lg group-hover:bg-neon-cyan/30 transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading text-xl font-bold uppercase tracking-widest text-white leading-none">ZENKAI</span>
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.3em] leading-none mt-0.5">v.2026</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <NavLink to="/" end className={({isActive}) => `font-heading text-sm uppercase tracking-widest transition-colors ${isActive ? 'text-neon-purple' : 'text-zinc-300 hover:text-white'}`} data-testid="nav-home">Home</NavLink>
                        <NavLink to="/shop" className={({isActive}) => `font-heading text-sm uppercase tracking-widest transition-colors ${isActive ? 'text-neon-purple' : 'text-zinc-300 hover:text-white'}`} data-testid="nav-shop">Shop</NavLink>
                        <div className="relative group">
                            <button className="font-heading text-sm uppercase tracking-widest text-zinc-300 hover:text-white transition-colors" data-testid="nav-categories">Categories</button>
                            <div className="absolute left-0 top-full mt-2 w-64 glass-elevated p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                {CATEGORIES.map((c) => (
                                    <Link key={c.slug} to={`/shop?category=${c.slug}`} className="block px-4 py-2 text-sm font-heading uppercase tracking-wider text-zinc-300 hover:text-neon-cyan hover:bg-white/5 transition-colors" data-testid={`cat-${c.slug}`}>
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        {user?.role === "admin" && (
                            <NavLink to="/admin" className={({isActive}) => `font-heading text-sm uppercase tracking-widest transition-colors ${isActive ? 'text-neon-magenta' : 'text-neon-magenta/70 hover:text-neon-magenta'}`} data-testid="nav-admin">Admin</NavLink>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <form onSubmit={submitSearch} className="hidden md:flex items-center relative" data-testid="search-form">
                            <Search className="absolute left-3 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search anime..."
                                className="bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-sm w-48 lg:w-64 focus:border-neon-purple focus:outline-none text-white placeholder-zinc-600 font-body"
                                data-testid="search-input"
                            />
                        </form>

                        {user ? (
                            <>
                                <Link to="/wishlist" className="p-2 hover:text-neon-magenta transition-colors text-zinc-300" data-testid="wishlist-link" title="Wishlist">
                                    <Heart className="w-5 h-5" strokeWidth={1.5} />
                                </Link>
                                <div className="relative">
                                    <button onClick={() => setUserMenu(!userMenu)} className="p-2 hover:text-neon-cyan transition-colors text-zinc-300" data-testid="user-menu-btn">
                                        <User className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                    {userMenu && (
                                        <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                                        <div className="absolute right-0 top-full mt-2 w-56 glass-elevated p-2 z-50" data-testid="user-menu">
                                            <div className="px-3 py-2 border-b border-white/5 mb-1">
                                                <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Logged in</div>
                                                <div className="text-sm text-white truncate">{user.email}</div>
                                            </div>
                                            <Link to="/profile" onClick={() => setUserMenu(false)} className="block px-3 py-2 text-sm font-heading uppercase tracking-wider text-zinc-300 hover:text-neon-cyan hover:bg-white/5" data-testid="profile-link">Profile</Link>
                                            <Link to="/orders" onClick={() => setUserMenu(false)} className="block px-3 py-2 text-sm font-heading uppercase tracking-wider text-zinc-300 hover:text-neon-cyan hover:bg-white/5" data-testid="orders-link">Orders</Link>
                                            <button onClick={async () => { await logout(); setUserMenu(false); navigate("/"); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-heading uppercase tracking-wider text-neon-magenta hover:bg-white/5" data-testid="logout-btn">
                                                <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
                                            </button>
                                        </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-block btn-neon-cyan py-1.5 px-4 text-xs" data-testid="login-link">Login</Link>
                        )}

                        <button onClick={onCartOpen} className="relative p-2 hover:text-neon-purple transition-colors text-zinc-300" data-testid="cart-btn">
                            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-neon-purple text-white text-[10px] font-bold font-mono px-1.5 py-0.5 min-w-[18px] text-center" data-testid="cart-count">
                                    {count}
                                </span>
                            )}
                        </button>

                        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-zinc-300" data-testid="mobile-menu-btn">
                            {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div className="lg:hidden border-t border-white/5 py-4 space-y-2" data-testid="mobile-menu">
                        <form onSubmit={submitSearch} className="flex items-center relative mb-3">
                            <Search className="absolute left-3 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anime..." className="bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-sm w-full text-white" />
                        </form>
                        <Link to="/" onClick={() => setOpen(false)} className="block py-2 font-heading uppercase tracking-widest text-sm text-zinc-300">Home</Link>
                        <Link to="/shop" onClick={() => setOpen(false)} className="block py-2 font-heading uppercase tracking-widest text-sm text-zinc-300">Shop</Link>
                        {CATEGORIES.map(c => <Link key={c.slug} to={`/shop?category=${c.slug}`} onClick={() => setOpen(false)} className="block py-2 pl-4 font-heading uppercase tracking-wider text-xs text-zinc-400">{c.name}</Link>)}
                        {user?.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 font-heading uppercase tracking-widest text-sm text-neon-magenta">Admin</Link>}
                        {!user && <Link to="/login" onClick={() => setOpen(false)} className="block py-2 font-heading uppercase tracking-widest text-sm text-neon-cyan">Login</Link>}
                    </div>
                )}
            </div>
        </header>
    );
}
