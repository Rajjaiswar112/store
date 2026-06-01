import React, { useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Zap, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const MagneticIcon = ({ children }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="relative flex items-center justify-center p-2 rounded-full cursor-pointer hover:bg-white/5 transition-colors group"
        >
            {children}
        </motion.div>
    );
};

export default function Navbar({ onCartOpen }) {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const submitSearch = (e) => {
        e.preventDefault();
        if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 group relative">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="relative flex items-center justify-center w-10 h-10 bg-black rounded-xl border border-white/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/40 to-[#06B6D4]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Zap className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 group-hover:from-[#7C3AED] group-hover:to-[#06B6D4] transition-all duration-500 leading-none">
                                ZENKAI
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-10">
                        <NavLink to="/" end className={({isActive}) => `relative font-bold text-sm uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-[#06B6D4]' : 'text-zinc-400 hover:text-white'}`}>
                            {({ isActive }) => (
                                <>
                                    Home
                                    {isActive && (
                                        <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#06B6D4] shadow-[0_0_10px_#06B6D4]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/shop" className={({isActive}) => `relative font-bold text-sm uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-[#EC4899]' : 'text-zinc-400 hover:text-white'}`}>
                            {({ isActive }) => (
                                <>
                                    Catalog
                                    {isActive && (
                                        <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#EC4899] shadow-[0_0_10px_#EC4899]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                        {user?.role === "admin" && (
                            <NavLink to="/admin" className={({isActive}) => `relative font-bold text-sm uppercase tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-[#7C3AED]' : 'text-zinc-400 hover:text-white'}`}>
                                {({ isActive }) => (
                                    <>
                                        System
                                        {isActive && (
                                            <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#7C3AED] shadow-[0_0_10px_#7C3AED]" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <form onSubmit={submitSearch} className="hidden md:flex items-center relative">
                            <motion.div
                                animate={{ width: isFocused ? 280 : 200 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="relative"
                            >
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isFocused ? 'text-[#06B6D4]' : 'text-zinc-500'}`} />
                                <input
                                    type="text"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="SEARCH DATABASE..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs font-bold tracking-widest uppercase text-white placeholder-zinc-600 focus:outline-none focus:border-[#06B6D4]/50 focus:bg-white/[0.05] transition-all"
                                />
                            </motion.div>
                        </form>

                        {user ? (
                            <div className="flex items-center gap-1">
                                <Link to="/wishlist">
                                    <MagneticIcon>
                                        <Heart className="w-5 h-5 text-zinc-300 group-hover:text-[#EC4899] transition-colors" />
                                    </MagneticIcon>
                                </Link>
                                
                                <div className="relative">
                                    <div onClick={() => setUserMenu(!userMenu)}>
                                        <MagneticIcon>
                                            <User className="w-5 h-5 text-zinc-300 group-hover:text-[#06B6D4] transition-colors" />
                                        </MagneticIcon>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {userMenu && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute right-0 top-full mt-4 w-60 bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                                                >
                                                    <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5 rounded-xl">
                                                        <div className="text-[10px] text-[#06B6D4] font-bold uppercase tracking-widest mb-1">Active User</div>
                                                        <div className="text-sm text-white truncate font-medium">{user.email}</div>
                                                    </div>
                                                    <Link to="/profile" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Profile Specs</Link>
                                                    <Link to="/orders" onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Order History</Link>
                                                    <button onClick={async () => { await logout(); setUserMenu(false); navigate("/"); }} className="w-full text-left flex items-center gap-3 px-4 py-2.5 mt-1 text-xs font-bold uppercase tracking-widest text-[#EC4899] hover:bg-[#EC4899]/10 rounded-lg transition-colors">
                                                        <LogOut className="w-4 h-4" /> Disconnect
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-flex px-5 py-2 text-xs font-bold uppercase tracking-widest text-black bg-white rounded-full hover:bg-[#06B6D4] transition-colors duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                                Link Start
                            </Link>
                        )}

                        <div onClick={onCartOpen} className="relative z-10">
                            <MagneticIcon>
                                <ShoppingCart className="w-5 h-5 text-zinc-300 group-hover:text-[#7C3AED] transition-colors" />
                                <AnimatePresence>
                                    {count > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute 0 top-1 right-1 bg-[#7C3AED] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)]"
                                        >
                                            {count}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </MagneticIcon>
                        </div>

                        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-zinc-300 hover:text-white">
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden overflow-hidden border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl"
                        >
                            <div className="py-6 px-2 space-y-4">
                                <form onSubmit={submitSearch} className="flex items-center relative mb-6 px-2">
                                    <Search className="absolute left-6 w-4 h-4 text-zinc-500" />
                                    <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold uppercase tracking-widest text-white focus:border-[#06B6D4] outline-none" />
                                </form>
                                <Link to="/" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.02] rounded-xl">Home Network</Link>
                                <Link to="/shop" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white bg-white/[0.02] rounded-xl">Catalog</Link>
                                {user?.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-widest text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-xl">System Admin</Link>}
                                {!user && <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-widest text-[#06B6D4] hover:bg-[#06B6D4]/10 rounded-xl">Link Start (Login)</Link>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}