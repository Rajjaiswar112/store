import React, { useEffect, useState } from "react";
import { api, CATEGORIES, formatPrice, errMsg } from "../lib/api";
import { Plus, Edit2, Trash2, Package, Users, DollarSign, ShoppingBag, Upload, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
    name: "", description: "", price: 0, category: "acrylic_plaques", anime: "", stock: 10,
    images: [], tags: [], featured: false, trending: false, best_seller: false, new_arrival: false,
};

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="glass p-5">
            <div className={`w-10 h-10 ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="font-mono text-3xl text-white">{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{label}</div>
        </div>
    );
}

export default function Admin() {
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tab, setTab] = useState("dashboard");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);

    const refresh = async () => {
        const [a, p, o] = await Promise.all([
            api.get("/admin/analytics"),
            api.get("/products?limit=200"),
            api.get("/admin/orders"),
        ]);
        setAnalytics(a.data); setProducts(p.data); setOrders(o.data);
    };
    useEffect(() => { refresh().catch(() => {}); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setTab("editor"); };
    const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setTab("editor"); };

    const saveProduct = async (e) => {
        e.preventDefault();
        const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
        try {
            if (editing) await api.put(`/products/${editing.id}`, payload);
            else await api.post("/products", payload);
            toast.success("Saved");
            await refresh(); setTab("products");
        } catch (e) { toast.error(errMsg(e)); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try { await api.delete(`/products/${id}`); toast.success("Deleted"); await refresh(); }
        catch (e) { toast.error(errMsg(e)); }
    };

    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        try {
            const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            const url = `${process.env.REACT_APP_BACKEND_URL}${data.url}`;
            setForm(f => ({ ...f, images: [...f.images, url] }));
            toast.success("Image uploaded");
        } catch (e) { toast.error(errMsg(e)); }
    };

    return (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="admin-page">
            <div className="mb-8 pb-6 border-b border-white/5 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-magenta mb-2">// admin_console</div>
                    <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white">Control Grid</h1>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["dashboard", "products", "orders"].map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-heading uppercase tracking-widest text-xs border transition-colors ${tab === t ? "border-neon-purple text-neon-purple" : "border-white/10 text-zinc-400 hover:text-white"}`} data-testid={`admin-tab-${t}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "dashboard" && analytics && (
                <div className="space-y-8" data-testid="admin-dashboard">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(analytics.total_revenue)} color="bg-neon-purple/15 text-neon-purple" />
                        <StatCard icon={ShoppingBag} label="Orders" value={analytics.total_orders} color="bg-neon-cyan/15 text-neon-cyan" />
                        <StatCard icon={Package} label="Products" value={analytics.total_products} color="bg-neon-magenta/15 text-neon-magenta" />
                        <StatCard icon={Users} label="Customers" value={analytics.total_users} color="bg-white/10 text-white" />
                    </div>
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div className="glass p-6">
                            <h3 className="font-heading text-xl uppercase tracking-tight text-white mb-4">Revenue by Category</h3>
                            <div className="space-y-2">
                                {analytics.revenue_by_category.length === 0 && <div className="text-zinc-500 text-sm font-body">No sales yet</div>}
                                {analytics.revenue_by_category.map(r => {
                                    const max = Math.max(...analytics.revenue_by_category.map(x => x.revenue), 1);
                                    return (
                                        <div key={r.category}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-mono uppercase tracking-widest text-zinc-400">{r.category.replace(/_/g, ' ')}</span>
                                                <span className="font-mono text-neon-purple">{formatPrice(r.revenue)}</span>
                                            </div>
                                            <div className="h-1 bg-white/5">
                                                <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" style={{ width: `${(r.revenue / max) * 100}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-heading text-xl uppercase tracking-tight text-white mb-4">Recent Orders</h3>
                            <div className="space-y-2">
                                {analytics.recent_orders.length === 0 && <div className="text-zinc-500 text-sm font-body">No orders yet</div>}
                                {analytics.recent_orders.map(o => (
                                    <div key={o.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <div>
                                            <div className="font-mono text-xs text-zinc-300">{o.email}</div>
                                            <div className="font-mono text-[10px] text-zinc-500">{new Date(o.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="font-mono text-neon-purple">{formatPrice(o.amount)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === "products" && (
                <div data-testid="admin-products">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-heading text-2xl uppercase tracking-tight text-white">Products ({products.length})</h2>
                        <button onClick={openCreate} className="btn-neon flex items-center gap-2" data-testid="new-product-btn">
                            <Plus className="w-4 h-4" strokeWidth={1.5} /> New Product
                        </button>
                    </div>
                    <div className="glass overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                                <tr>
                                    <th className="text-left p-3">Image</th>
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Category</th>
                                    <th className="text-right p-3">Price</th>
                                    <th className="text-right p-3">Stock</th>
                                    <th className="text-right p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="p-3"><img src={p.images?.[0]} alt="" className="w-12 h-12 object-cover bg-black" /></td>
                                        <td className="p-3 font-heading uppercase text-white">{p.name}</td>
                                        <td className="p-3 font-mono text-xs text-zinc-400 uppercase">{p.category.replace(/_/g, ' ')}</td>
                                        <td className="p-3 font-mono text-right text-neon-purple">{formatPrice(p.price)}</td>
                                        <td className="p-3 font-mono text-right text-zinc-400">{p.stock}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => openEdit(p)} className="p-1.5 text-zinc-400 hover:text-neon-cyan mr-1" data-testid={`edit-${p.id}`}><Edit2 className="w-4 h-4" strokeWidth={1.5} /></button>
                                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-zinc-400 hover:text-neon-magenta" data-testid={`delete-${p.id}`}><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "orders" && (
                <div data-testid="admin-orders">
                    <h2 className="font-heading text-2xl uppercase tracking-tight text-white mb-4">Orders ({orders.length})</h2>
                    <div className="glass overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                                <tr>
                                    <th className="text-left p-3">Order</th>
                                    <th className="text-left p-3">Customer</th>
                                    <th className="text-left p-3">Items</th>
                                    <th className="text-right p-3">Amount</th>
                                    <th className="text-right p-3">Status</th>
                                    <th className="text-right p-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-zinc-500 font-mono uppercase tracking-widest text-xs">No orders yet</td></tr>}
                                {orders.map(o => (
                                    <tr key={o.id} className="border-b border-white/5">
                                        <td className="p-3 font-mono text-xs text-zinc-400">{o.id.slice(0, 8)}</td>
                                        <td className="p-3 text-zinc-300">{o.email}</td>
                                        <td className="p-3 font-mono text-xs text-zinc-400 max-w-[200px] truncate">{(o.summary || []).join(", ")}</td>
                                        <td className="p-3 font-mono text-right text-neon-purple">{formatPrice(o.amount)}</td>
                                        <td className="p-3 text-right"><span className="px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 font-mono text-[10px] uppercase tracking-widest text-neon-cyan">{o.status}</span></td>
                                        <td className="p-3 font-mono text-right text-zinc-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "editor" && (
                <form onSubmit={saveProduct} className="glass p-6 space-y-4 max-w-3xl" data-testid="product-editor">
                    <h2 className="font-heading text-2xl uppercase tracking-tight text-white">{editing ? "Edit Product" : "New Product"}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Name</label>
                            <input className="input-neon" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} data-testid="form-name" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Description</label>
                            <textarea className="input-neon min-h-[80px]" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} data-testid="form-desc" />
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Category</label>
                            <select className="input-neon" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} data-testid="form-category">
                                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Anime</label>
                            <input className="input-neon" value={form.anime} onChange={(e) => setForm({...form, anime: e.target.value})} data-testid="form-anime" />
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Price (USD)</label>
                            <input type="number" step="0.01" className="input-neon" required value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} data-testid="form-price" />
                        </div>
                        <div>
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Stock</label>
                            <input type="number" className="input-neon" required value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} data-testid="form-stock" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Images</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.images.map((url, i) => (
                                    <div key={i} className="relative w-20 h-20 border border-white/10">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setForm(f => ({...f, images: f.images.filter((_, idx) => idx !== i)}))} className="absolute -top-2 -right-2 bg-neon-magenta text-white w-5 h-5 flex items-center justify-center"><X className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                            <label className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 cursor-pointer hover:border-neon-cyan font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-neon-cyan" data-testid="upload-image">
                                <Upload className="w-4 h-4" strokeWidth={1.5} /> Upload Image
                                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                            </label>
                            <input type="text" placeholder="Or paste image URL" className="input-neon mt-2 text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { e.preventDefault(); setForm(f => ({...f, images: [...f.images, e.target.value]})); e.target.value = ''; }}} />
                        </div>
                        <div className="sm:col-span-2 flex flex-wrap gap-4">
                            {["featured", "trending", "best_seller", "new_arrival"].map(flag => (
                                <label key={flag} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
                                    <input type="checkbox" checked={form[flag]} onChange={(e) => setForm({...form, [flag]: e.target.checked})} className="accent-neon-purple" data-testid={`form-${flag}`} />
                                    {flag.replace(/_/g, ' ')}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <button type="submit" className="btn-neon" data-testid="save-product">{editing ? "Update" : "Create"}</button>
                        <button type="button" onClick={() => setTab("products")} className="btn-neon-cyan">Cancel</button>
                    </div>
                </form>
            )}
        </main>
    );
}
