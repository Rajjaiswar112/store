import React, { useState, useEffect } from "react";
import { api, formatPrice } from "../lib/api";
import { Edit, Trash2, Plus, X, Package, PackageX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        stock: 0,
        category: "",
        description: ""
    });

    const fetchProducts = async () => {
        try {
            const { data } = await api.get("/products?limit=1000");
            setProducts(data);
        } catch (error) {
            toast.error("Failed to fetch database");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingId(product._id || product.id);
            setFormData({
                name: product.name || "",
                price: product.price || 0,
                stock: product.stock !== undefined ? product.stock : 10,
                category: product.category || "",
                description: product.description || ""
            });
        } else {
            setEditingId(null);
            setFormData({ name: "", price: 0, stock: 10, category: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
                toast.success("Artifact updated successfully");
            } else {
                await api.post(`/products`, formData);
                toast.success("New artifact deployed");
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error("System error: Could not save");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("WARNING: Are you sure you want to permanently delete this artifact?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Artifact eradicated");
            fetchProducts();
        } catch (error) {
            toast.error("System error: Could not delete");
        }
    };

    const toggleStock = async (product) => {
        const pid = product._id || product.id;
        const newStock = product.stock === 0 ? 15 : 0;
        try {
            await api.put(`/products/${pid}`, { stock: newStock });
            toast.success(newStock === 0 ? "Marked Out of Stock" : "Restocked Successfully");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to update inventory");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 px-6 pb-20 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#06B6D4]/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                    <div>
                        <div className="font-mono text-xs uppercase tracking-[0.4em] text-[#EC4899] mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Root Access Granted
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white">
                            Command <span className="text-[#06B6D4]">Center</span>
                        </h1>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                    >
                        <Plus className="w-4 h-4" /> Deploy Artifact
                    </button>
                </div>

                <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40">
                                    <th className="p-5 font-mono text-xs uppercase tracking-widest text-zinc-500">Asset</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-widest text-zinc-500">Category</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-widest text-zinc-500">Value</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-widest text-zinc-500">Status</th>
                                    <th className="p-5 font-mono text-xs uppercase tracking-widest text-zinc-500 text-right">Overrides</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-zinc-500 font-mono animate-pulse">Scanning database...</td>
                                    </tr>
                                ) : products.map((p) => (
                                    <tr key={p._id || p.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <img src={p.image || p.images?.[0] || "https://via.placeholder.com/50"} alt={p.name} className="w-12 h-12 rounded object-cover border border-white/10" />
                                                <span className="font-heading uppercase tracking-wider text-white text-sm">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 font-mono text-xs text-[#06B6D4] uppercase tracking-widest">{p.category}</td>
                                        <td className="p-5 font-mono text-sm text-white font-bold">{formatPrice(p.price)}</td>
                                        <td className="p-5">
                                            <button 
                                                onClick={() => toggleStock(p)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all ${p.stock === 0 ? 'bg-[#EC4899]/10 border-[#EC4899]/30 text-[#EC4899] hover:bg-[#EC4899]/20' : 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#06B6D4] hover:bg-[#06B6D4]/20'}`}
                                            >
                                                {p.stock === 0 ? <><PackageX className="w-3 h-3" /> Depleted</> : <><Package className="w-3 h-3" /> Active</>}
                                            </button>
                                        </td>
                                        <td className="p-5 text-right space-x-3">
                                            <button onClick={() => handleOpenModal(p)} className="p-2 text-zinc-400 hover:text-[#06B6D4] transition-colors rounded-lg hover:bg-[#06B6D4]/10">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p._id || p.id)} className="p-2 text-zinc-400 hover:text-[#EC4899] transition-colors rounded-lg hover:bg-[#EC4899]/10">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <h2 className="font-heading text-2xl uppercase tracking-tight text-white">
                                {editingId ? "Modify Artifact" : "Deploy New Artifact"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-[#EC4899] transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">Artifact Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] font-heading uppercase tracking-wide"
                                    />
                                </div>
                                <div>
                                    <label className="block font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">Price (INR)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">Stock Level</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] font-mono"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">Category Slug</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] font-mono lowercase"
                                        placeholder="e.g. acrylic_plaques"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold uppercase tracking-widest text-xs text-zinc-400 hover:text-white transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-[#06B6D4] hover:bg-[#0891B2] text-black px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                    {editingId ? "Execute Update" : "Execute Deployment"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}