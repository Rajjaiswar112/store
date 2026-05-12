import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, CATEGORIES, categoryName } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";

export default function Shop() {
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("default");

    const category = params.get("category") || "";
    const search = params.get("search") || "";

    useEffect(() => {
        setLoading(true);
        const q = new URLSearchParams();
        if (category) q.set("category", category);
        if (search) q.set("search", search);
        q.set("limit", "100");
        api.get(`/products?${q.toString()}`).then(({ data }) => {
            let list = [...data];
            if (sort === "price_asc") list.sort((a,b) => a.price - b.price);
            if (sort === "price_desc") list.sort((a,b) => b.price - a.price);
            if (sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
            setProducts(list);
        }).finally(() => setLoading(false));
    }, [category, search, sort]);

    const setCategory = (slug) => {
        const p = new URLSearchParams(params);
        if (slug) p.set("category", slug); else p.delete("category");
        setParams(p);
    };

    return (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="shop-page">
            <div className="mb-10 pb-6 border-b border-white/5">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">// shop_catalog</div>
                <h1 className="font-heading text-4xl sm:text-6xl uppercase tracking-tight text-white" data-testid="shop-title">
                    {category ? categoryName(category) : search ? `Results: ${search}` : "All Products"}
                </h1>
                {search && <p className="text-zinc-400 mt-2 font-body">Found {products.length} item{products.length !== 1 ? "s" : ""}</p>}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-3 space-y-6" data-testid="shop-filters">
                    <div className="glass p-5">
                        <div className="font-heading text-sm uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-neon-purple" strokeWidth={1.5} /> Filters
                        </div>

                        <div className="mb-5">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Categories</div>
                            <div className="space-y-1">
                                <button onClick={() => setCategory("")} className={`block w-full text-left px-2 py-1.5 text-sm font-heading uppercase tracking-wider transition-colors ${!category ? 'text-neon-purple' : 'text-zinc-400 hover:text-white'}`} data-testid="filter-all">
                                    All
                                </button>
                                {CATEGORIES.map(c => (
                                    <button key={c.slug} onClick={() => setCategory(c.slug)} className={`block w-full text-left px-2 py-1.5 text-sm font-heading uppercase tracking-wider transition-colors ${category === c.slug ? 'text-neon-purple' : 'text-zinc-400 hover:text-white'}`} data-testid={`filter-${c.slug}`}>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(category || search) && (
                            <button onClick={() => setParams({})} className="text-xs flex items-center gap-1 text-neon-magenta hover:text-white" data-testid="clear-filters">
                                <X className="w-3 h-3" /> Clear filters
                            </button>
                        )}
                    </div>
                </aside>

                {/* Grid */}
                <section className="lg:col-span-9">
                    <div className="flex items-center justify-between mb-5">
                        <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{loading ? "Loading..." : `${products.length} item${products.length !== 1 ? "s" : ""}`}</div>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-black/60 border border-white/10 px-3 py-2 text-sm font-mono text-white focus:border-neon-purple focus:outline-none" data-testid="sort-select">
                            <option value="default">Default</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                            <option value="name">Name A-Z</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-20 text-center" data-testid="empty-shop">
                            <div className="font-heading text-zinc-500 uppercase tracking-widest text-lg">No products found</div>
                            <Link to="/shop" className="inline-block mt-4 btn-neon">Reset</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5" data-testid="shop-grid">
                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
