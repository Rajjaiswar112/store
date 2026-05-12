import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Mail, Lock, User } from "lucide-react";
import { errMsg } from "../lib/api";
import { toast } from "sonner";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success("Welcome to Zenkai.");
            nav("/", { replace: true });
        } catch (e) { toast.error(errMsg(e)); }
        finally { setLoading(false); }
    };

    return (
        <main className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <Zap className="w-10 h-10 text-neon-purple group-hover:text-neon-cyan transition-colors" strokeWidth={1.5} />
                    <span className="font-heading text-3xl font-bold uppercase tracking-widest text-white">ZENKAI</span>
                </Link>

                <div className="glass-elevated p-8 sm:p-10" data-testid="register-form">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan mb-2">// new_user</div>
                    <h1 className="font-heading text-3xl uppercase tracking-tight text-white mb-1">Join the Grid</h1>
                    <p className="text-zinc-500 font-body text-sm mb-6">Create your Zenkai account.</p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                                <input required value={name} onChange={(e) => setName(e.target.value)} className="input-neon pl-10" placeholder="Otaku_2026" data-testid="register-name" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-neon pl-10" placeholder="you@example.com" data-testid="register-email" />
                            </div>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-neon pl-10" placeholder="min 6 chars" data-testid="register-password" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-neon w-full" data-testid="register-submit">
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm text-zinc-400 font-body">
                        Already registered?{" "}
                        <Link to="/login" className="text-neon-cyan hover:text-white font-heading uppercase tracking-widest text-xs" data-testid="back-login-link">Sign in</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
