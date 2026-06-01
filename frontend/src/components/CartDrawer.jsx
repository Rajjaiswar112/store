import React from "react";
import { X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
    const { items, total, update, remove, count } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();

    const checkout = () => {
        if (!user) { 
            onClose(); 
            nav("/login"); 
            return; 
        }
        if (!items.length) return;
        onClose();
        nav("/checkout");
    };

    return (
        <>
            {open && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} data-testid="cart-overlay" />}
            <aside className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0a0a0f] border-l border-white/10 z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`} data-testid="cart-drawer">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#06B6D4]">// cart_module</div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-white">Your Cart {count > 0 && <span className="text-[#7C3AED]">({count})</span>}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:text-[#EC4899] transition-colors" data-testid="cart-close"><X className="w-5 h-5" strokeWidth={2} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {!items.length && (
                        <div className="text-center py-16">
                            <div className="font-bold text-zinc-500 uppercase tracking-widest text-sm" data-testid="empty-cart">Cart is empty</div>
                            <Link to="/shop" onClick={onClose} className="inline-block mt-4 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">Start Shopping</Link>
                        </div>
                    )}
                    {items.map((it) => {
                        const pid = it.product?._id || it.product?.id || it.product_id || it._id;
                        
                        return (
                            <div key={pid} className="flex gap-3 border border-white/5 p-3 bg-black/40 rounded-xl" data-testid={`cart-item-${pid}`}>
                                <img src={it.product?.images?.[0] || it.product?.image} alt={it.product?.name} className="w-20 h-20 object-cover flex-shrink-0 bg-black rounded-lg" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm uppercase tracking-wider text-white line-clamp-2">{it.product?.name}</div>
                                    <div className="font-mono text-[#06B6D4] font-bold text-sm mt-1">{formatPrice(it.product?.price || 0)}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => update(pid, Math.max(1, it.quantity - 1))} className="w-7 h-7 border border-white/10 hover:border-[#7C3AED] rounded-md flex items-center justify-center transition-colors" data-testid={`qty-minus-${pid}`}><Minus className="w-3 h-3" strokeWidth={2} /></button>
                                        <span className="font-mono text-sm w-8 text-center">{it.quantity}</span>
                                        <button onClick={() => update(pid, it.quantity + 1)} className="w-7 h-7 border border-white/10 hover:border-[#7C3AED] rounded-md flex items-center justify-center transition-colors" data-testid={`qty-plus-${pid}`}><Plus className="w-3 h-3" strokeWidth={2} /></button>
                                        <button onClick={() => remove(pid)} className="ml-auto p-1.5 text-zinc-500 hover:text-[#EC4899] transition-colors" data-testid={`cart-remove-${pid}`}><Trash2 className="w-4 h-4" strokeWidth={2} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-white/5 space-y-4 bg-black/40">
                        <div className="flex justify-between font-mono text-sm font-bold">
                            <span className="text-zinc-400 uppercase tracking-widest">Subtotal</span>
                            <span className="text-white">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between font-black text-2xl uppercase tracking-tighter">
                            <span className="text-white">Total</span>
                            <span className="text-[#06B6D4]">{formatPrice(total)}</span>
                        </div>
                        <button onClick={checkout} className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2" data-testid="checkout-btn">
                            Initialize Checkout <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}