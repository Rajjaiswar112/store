import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Flame, Star } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import gunDevil from '../images/gunDevil.jpg';
import gojo from '../images/gojo.jpg';

const HERO_IMG = "https://images.pexels.com/photos/28122495/pexels-photo-28122495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

const ANIME_TICKERS = ["DEMON SLAYER", "ATTACK ON TITAN", "JUJUTSU KAISEN", "ONE PIECE", "NARUTO", "CHAINSAW MAN", "BERSERK", "EVANGELION", "SPY x FAMILY", "DEATH NOTE", "BLEACH", "MY HERO ACADEMIA"];

function SectionHeader({ kicker, title, link }) {
    return (
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
            <div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.4em] text-neon-cyan mb-2">{kicker}</div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">{title}</h2>
            </div>
            {link && (
                <Link to={link} className="hidden sm:flex items-center gap-2 font-heading uppercase tracking-widest text-xs text-neon-purple hover:text-white transition-colors group" data-testid="section-view-all">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                </Link>
            )}
        </div>
    );
}

export default function Home() {
    const [trending, setTrending] = useState([]);
    const [bestSellers, setBest] = useState([]);
    const [newArrivals, setNew] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        (async () => {
            const [t, b, n, f, c] = await Promise.all([
                api.get("/products?trending=true&limit=8"),
                api.get("/products?best_seller=true&limit=8"),
                api.get("/products?new_arrival=true&limit=8"),
                api.get("/products?featured=true&limit=6"),
                api.get("/products/categories"),
            ]);
            setTrending(t.data); setBest(b.data); setNew(n.data); setFeatured(f.data); setCategories(c.data);
        })().catch(() => {});
    }, []);

    return (
        <main className="relative z-10">
            <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-grid" data-testid="hero-section">
                <div className="absolute inset-0">
                    <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
                    <div className="absolute inset-0 scanlines" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-12 gap-10 items-center w-full">
                    <div className="lg:col-span-7 space-y-6 animate-fade-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass border border-neon-purple/30">
                            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan"></span>
                        </div>
                        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tighter leading-[0.85] text-white" data-testid="hero-title">
                            Power Your<br />
                            <span className="text-neon-purple" style={{textShadow:'0 0 40px rgba(176,38,255,0.5)'}}>Anime</span>{" "}
                            <span className="text-neon-cyan" style={{textShadow:'0 0 40px rgba(0,243,255,0.5)'}}>World</span>
                        </h1>
                        <p className="text-zinc-300 text-lg max-w-xl leading-relaxed font-body" data-testid="hero-tagline">
                            Premium acrylic plaques, LED frames & neon collectibles. Forged for the new wave of otaku — built for the cyberpunk era.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/shop" className="btn-neon flex items-center gap-2" data-testid="hero-shop-btn">
                                Enter the Grid <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                            </Link>
                            <Link to="/shop?category=led_frames" className="btn-neon-cyan flex items-center gap-2" data-testid="hero-explore-btn">
                                <Zap className="w-4 h-4" strokeWidth={1.5} /> Explore LED
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-8 max-w-lg">
                            <div>
                                <div className="font-mono text-2xl text-neon-purple">19+</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Products</div>
                            </div>
                            <div>
                                <div className="font-mono text-2xl text-neon-cyan">5</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Categories</div>
                            </div>
                            <div>
                                <div className="font-mono text-2xl text-neon-magenta">24/7</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Drop Alerts</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="relative animate-float">
                            <div className="absolute -inset-2 bg-gradient-to-br from-neon-purple/30 via-transparent to-neon-cyan/30 blur-2xl" />
                            <img src="https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png"
                                 alt="Neon collectible"
                                 className="relative w-full aspect-[3/4] object-cover border border-neon-purple/30" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-white/5 bg-black/60 overflow-hidden py-4">
                <div className="flex marquee-track whitespace-nowrap">
                    {[...ANIME_TICKERS, ...ANIME_TICKERS].map((a, i) => (
                        <div key={i} className="flex items-center gap-4 px-6">
                            <span className="text-neon-purple text-xs">◆</span>
                            <span className="font-mono text-sm uppercase tracking-widest text-zinc-400">{a}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="categories-section">
                <SectionHeader kicker="" title="Featured Collections" link="/shop" />
                <div className="grid grid-cols-12 grid-rows-2 gap-3 sm:gap-4 h-[600px] sm:h-[500px]">
                    {categories[0] && (
                        <Link to={`/shop?category=${categories[0].slug}`} className="col-span-12 sm:col-span-6 row-span-2 relative group overflow-hidden neon-border bg-black" data-testid={`cat-card-${categories[0].slug}`}>
                            <img src={gunDevil} alt={categories[0].name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                                <div className="font-mono text-xs text-neon-cyan uppercase tracking-widest mb-2"></div>
                                <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-white mb-2">{categories[0].name}</h3>
                                <p className="text-zinc-400 text-sm max-w-xs mb-4">{categories[0].description}</p>
                                <div className="inline-flex items-center gap-2 text-neon-purple font-heading uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                                    Explore <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                            </div>
                        </Link>
                    )}
                    {categories.slice(1, 5).map((c, i) => (
                        <Link key={c.slug} to={`/shop?category=${c.slug}`} className={`col-span-6 sm:col-span-3 row-span-1 relative group overflow-hidden neon-border bg-black`} data-testid={`cat-card-${c.slug}`}>
                            <img src={gojo}  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4">
                                <div className="font-mono text-[10px] text-neon-cyan uppercase tracking-widest mb-1">0{i+2}</div>
                                <h3 className="font-heading text-lg sm:text-xl uppercase tracking-tight text-white">{c.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="trending-section">
                <SectionHeader kicker="" title={<><Flame className="inline w-8 h-8 mr-2 text-neon-magenta" strokeWidth={1.5} />Trending Now</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {trending.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link to="/shop" className="block relative overflow-hidden neon-border h-[400px] sm:h-[500px] group" data-testid="featured-banner">
                    <img src={gojo} alt="Satoru Gojo Banner" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
                    <div className="absolute inset-0 flex items-center p-8 sm:p-16">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 border border-neon-magenta text-neon-magenta">
                                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Featured Drop</span>
                            </div>
                            <h3 className="font-heading text-4xl sm:text-6xl uppercase tracking-tight text-white mb-4">Satoru Gojo <br/><span className="text-neon-cyan">Infinite Void</span></h3>
                            <p className="text-zinc-400 mb-6 max-w-md font-body">Bring the strongest sorcerer into your physical space. This premium acrylic plaque reacts to your room's ambient light, creating an expanding void effect.</p>
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-3xl text-neon-purple">₹3,500.00</span>
                                <span className="btn-neon">Shop Now</span>
                            </div>
                        </div>
                    </div>
                </Link>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="bestsellers-section">
                <SectionHeader kicker="" title={<><Star className="inline w-8 h-8 mr-2 text-neon-cyan" strokeWidth={1.5} />Best Sellers</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {bestSellers.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="newarrivals-section">
                <SectionHeader kicker="" title={<><Sparkles className="inline w-8 h-8 mr-2 text-neon-purple" strokeWidth={1.5} />New Arrivals</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </section>
        </main>
    );
}