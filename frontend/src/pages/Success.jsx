import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, formatPrice } from "../lib/api";
import { Check, Loader2, X } from "lucide-react";

export default function Success() {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");
    const [status, setStatus] = useState({ payment_status: "pending" });
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (!sessionId) return;
        let timer;
        const poll = async () => {
            try {
                const { data } = await api.get(`/checkout/status/${sessionId}`);
                setStatus(data);
                if (data.payment_status !== "paid" && data.status !== "expired" && attempts < 12) {
                    timer = setTimeout(() => setAttempts(a => a + 1), 2500);
                }
            } catch {
                if (attempts < 12) timer = setTimeout(() => setAttempts(a => a + 1), 2500);
            }
        };
        poll();
        return () => timer && clearTimeout(timer);
    }, [sessionId, attempts]);

    const isPaid = status.payment_status === "paid";
    const isExpired = status.status === "expired";

    return (
        <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20" data-testid="success-page">
            <div className="glass-elevated p-10 text-center">
                {isPaid ? (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 border border-neon-cyan flex items-center justify-center glow-cyan">
                            <Check className="w-10 h-10 text-neon-cyan" strokeWidth={1.5} />
                        </div>
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">// payment_confirmed</div>
                        <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white mb-3" data-testid="success-title">Order Confirmed</h1>
                        <p className="text-zinc-400 font-body max-w-md mx-auto mb-6">
                            Your payment of <span className="text-neon-purple font-mono">{formatPrice((status.amount_total || 0) / 100)}</span> was successful. Your transmission is now in the queue.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/profile" className="btn-neon" data-testid="view-orders-btn">View Orders</Link>
                            <Link to="/shop" className="btn-neon-cyan">Keep Shopping</Link>
                        </div>
                    </>
                ) : isExpired ? (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 border border-neon-magenta flex items-center justify-center">
                            <X className="w-10 h-10 text-neon-magenta" strokeWidth={1.5} />
                        </div>
                        <h1 className="font-heading text-4xl uppercase tracking-tight text-white mb-3">Session Expired</h1>
                        <p className="text-zinc-400 mb-6">Please try checkout again from your cart.</p>
                        <Link to="/shop" className="btn-neon">Back to Shop</Link>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-12 h-12 text-neon-purple mx-auto mb-6 animate-spin" strokeWidth={1.5} />
                        <h1 className="font-heading text-3xl uppercase tracking-tight text-white mb-2">Verifying payment</h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest" data-testid="polling-status">// polling.gateway... ({attempts + 1}/12)</p>
                    </>
                )}
            </div>
        </main>
    );
}
