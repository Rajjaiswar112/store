import React from "react";
import { X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, api, errMsg } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CartDrawer({ open, onClose }) {
    const { items, total, update, remove, count } = useCart();
    const { user } = useAuth();
    const nav = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const checkout = async () => {
        if (!user) { onClose(); nav("/login"); return; }
        if (!items.length) return;
        setLoading(true);
        try {
            const { data } = await api.post("/checkout/session", { origin_url: window.location.origin });
            window.location.href = data.url;
        } catch (e) { toast.error(errMsg(e)); setLoading(false); }
    };

    return (
        <>
            {open && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose} data-testid="cart-overlay" />}
            <aside className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#0a0a0f] border-l border-white/10 z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`} data-testid="cart-drawer">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">// cart_module</div>
                        <h3 className="font-heading text-2xl uppercase tracking-tight text-white">Your Cart {count > 0 && <span className="text-neon-purple">({count})</span>}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:text-neon-magenta transition-colors" data-testid="cart-close"><X className="w-5 h-5" strokeWidth={1.5} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {!items.length && (
                        <div className="text-center py-16">
                            <div className="font-heading text-zinc-500 uppercase tracking-widest text-sm" data-testid="empty-cart">Cart is empty</div>
                            <Link to="/shop" onClick={onClose} className="inline-block mt-4 btn-neon">Start Shopping</Link>
                        </div>
                    )}
                    {items.map((it) => (
                        <div key={it.product_id} className="flex gap-3 border border-white/5 p-3 bg-black/40" data-testid={`cart-item-${it.product_id}`}>
                            <img src={it.product?.images?.[0]} alt={it.product?.name} className="w-20 h-20 object-cover flex-shrink-0 bg-black" />
                            <div className="flex-1 min-w-0">
                                <div className="font-heading text-sm uppercase tracking-tight text-white line-clamp-2">{it.product?.name}</div>
                                <div className="font-mono text-neon-cyan text-sm mt-1">{formatPrice(it.product?.price || 0)}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => update(it.product_id, Math.max(1, it.quantity - 1))} className="w-7 h-7 border border-white/10 hover:border-neon-purple flex items-center justify-center" data-testid={`qty-minus-${it.product_id}`}><Minus className="w-3 h-3" strokeWidth={1.5} /></button>
                                    <span className="font-mono text-sm w-8 text-center">{it.quantity}</span>
                                    <button onClick={() => update(it.product_id, it.quantity + 1)} className="w-7 h-7 border border-white/10 hover:border-neon-purple flex items-center justify-center" data-testid={`qty-plus-${it.product_id}`}><Plus className="w-3 h-3" strokeWidth={1.5} /></button>
                                    <button onClick={() => remove(it.product_id)} className="ml-auto p-1.5 text-zinc-500 hover:text-neon-magenta" data-testid={`cart-remove-${it.product_id}`}><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-white/5 space-y-3 bg-black/40">
                        <div className="flex justify-between font-mono text-sm">
                            <span className="text-zinc-400 uppercase tracking-widest">Subtotal</span>
                            <span className="text-white">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between font-heading text-xl">
                            <span className="uppercase tracking-tight text-white">Total</span>
                            <span className="text-neon-purple">{formatPrice(total)}</span>
                        </div>
                        <button onClick={checkout} disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2" data-testid="checkout-btn">
                            {loading ? "Initializing..." : <>Checkout <ArrowRight className="w-4 h-4" strokeWidth={1.5} /></>}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
