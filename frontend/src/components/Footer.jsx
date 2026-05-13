import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Send, Github, Twitter, Instagram } from "lucide-react";
import { api, errMsg } from "../lib/api";
import { toast } from "sonner";
import { CATEGORIES } from "../lib/api";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const subscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            await api.post("/newsletter", { email });
            toast.success("Welcome to the cyber-resistance, comrade.");
            setEmail("");
        } catch (e) {
            toast.error(errMsg(e));
        } finally { setSubmitting(false); }
    };

    return (
        <footer className="border-t border-white/5 bg-[#0a0a0f] mt-20" data-testid="footer">
            {/* Newsletter */}
            <div className="border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="text-neon-cyan font-mono text-xs uppercase tracking-[0.3em] mb-3">// transmission_01</div>
                        <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-white mb-3">Join the Resistance</h3>
                        <p className="text-zinc-400 max-w-md">Drop your email — get exclusive drops, neon arrivals & early access to limited collectibles.</p>
                    </div>
                    <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="enter.your@email"
                            className="flex-1 bg-black/60 border border-white/10 px-4 py-3 font-mono text-sm text-white focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                            data-testid="newsletter-input"
                        />
                        <button disabled={submitting} type="submit" className="btn-neon-cyan flex items-center justify-center gap-2" data-testid="newsletter-submit">
                            <Send className="w-4 h-4" strokeWidth={1.5} />
                            {submitting ? "Sending" : "Subscribe"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2">
                    <Link to="/" className="flex items-center gap-2 mb-4">
                        <Zap className="w-8 h-8 text-neon-purple" strokeWidth={1.5} />
                        <span className="font-heading text-2xl font-bold uppercase tracking-widest">ZENKAI</span>
                    </Link>
                    <p className="text-zinc-400 max-w-sm mb-4">Power Your Anime World. Premium acrylic art, LED frames, and neon collectibles for the next generation of otaku.</p>
                    <div className="flex gap-3">
                        <a href="#" className="p-2 border border-white/10 hover:border-neon-purple hover:text-neon-purple transition-colors" data-testid="social-twitter"><Twitter className="w-4 h-4" strokeWidth={1.5} /></a>
                        <a href="#" className="p-2 border border-white/10 hover:border-neon-purple hover:text-neon-purple transition-colors" data-testid="social-instagram"><Instagram className="w-4 h-4" strokeWidth={1.5} /></a>
                        <a href="#" className="p-2 border border-white/10 hover:border-neon-purple hover:text-neon-purple transition-colors" data-testid="social-github"><Github className="w-4 h-4" strokeWidth={1.5} /></a>
                    </div>
                </div>

                <div>
                    <div className="font-heading text-sm uppercase tracking-widest text-white mb-4">Shop</div>
                    <ul className="space-y-2 text-sm">
                        {CATEGORIES.map(c => (
                            <li key={c.slug}>
                                <Link to={`/shop?category=${c.slug}`} className="text-zinc-400 hover:text-neon-cyan transition-colors">{c.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div className="font-heading text-sm uppercase tracking-widest text-white mb-4">Support</div>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li><Link to="/shop" className="hover:text-neon-cyan transition-colors">All Products</Link></li>
                        <li><Link to="/profile" className="hover:text-neon-cyan transition-colors">My Account</Link></li>
                        <li><a href="#" className="hover:text-neon-cyan transition-colors">Shipping</a></li>
                        <li><a href="#" className="hover:text-neon-cyan transition-colors">Returns</a></li>
                        <li><a href="#" className="hover:text-neon-cyan transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="font-mono text-xs text-zinc-600 tracking-wider">© 2026 ZENKAI // ALL_SIGNALS_RESERVED</div>
                    <div className="font-mono text-xs text-zinc-600 tracking-wider">SYSTEM.STATUS — <span className="text-neon-cyan">ONLINE</span></div>
                </div>
            </div>
        </footer>
    );
}
