import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Flame, Star, Globe, Shield, Clock } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import FeaturedProduct from "../components/FeaturedProduct";
import gunDevil from '../images/gunDevil.jpg';
import gojo from '../images/gojo.jpg';

const HERO_IMG = "https://images.pexels.com/photos/28122495/pexels-photo-28122495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

const ANIME_TICKERS = ["DEMON SLAYER", "ATTACK ON TITAN", "JUJUTSU KAISEN", "ONE PIECE", "NARUTO", "CHAINSAW MAN", "BERSERK", "EVANGELION", "SPY x FAMILY", "DEATH NOTE", "BLEACH", "MY HERO ACADEMIA"];

const fallbacks = [
    { title: "GLOBAL DEPLOYMENT", kicker: "WORLDWIDE SHIPPING", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500&auto=format&fit=crop", icon: Globe, link: "/shop" },
    { title: "NEON SYNC TECH", kicker: "SMART LED INTEGRATION", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500&auto=format&fit=crop", icon: Zap, link: "/shop?category=led_frames" },
    { title: "SECURE RELAY", kicker: "ENCRYPTED TRANSACTIONS", img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=500&auto=format&fit=crop", icon: Shield, link: "/shop" },
    { title: "24/7 OVERWATCH", kicker: "ELITE SUPPORT TEAM", img: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=500&auto=format&fit=crop", icon: Clock, link: "/shop" }
];

function SectionHeader({ kicker, title, link }) {
    return (
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
            <div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.4em] text-[#06B6D4] mb-2">{kicker}</div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white">{title}</h2>
            </div>
            {link && (
                <Link to={link} className="hidden sm:flex items-center gap-2 font-heading uppercase tracking-widest text-xs text-[#7C3AED] hover:text-white transition-colors group" data-testid="section-view-all">
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

    const mainFeature = featured.find(p => p.name?.toUpperCase().includes("GOJO")) || 
                        trending.find(p => p.name?.toUpperCase().includes("GOJO")) || 
                        featured[0] || bestSellers[0];

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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass border border-[#7C3AED]/30">
                            <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#06B6D4]"></span>
                        </div>
                        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tighter leading-[0.85] text-white" data-testid="hero-title">
                            Power Your<br />
                            <span className="text-[#7C3AED]" style={{textShadow:'0 0 40px rgba(124,58,237,0.5)'}}>Anime</span>{" "}
                            <span className="text-[#06B6D4]" style={{textShadow:'0 0 40px rgba(6,182,212,0.5)'}}>World</span>
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
                                <div className="font-mono text-2xl text-[#7C3AED]">19+</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Products</div>
                            </div>
                            <div>
                                <div className="font-mono text-2xl text-[#06B6D4]">5</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Categories</div>
                            </div>
                            <div>
                                <div className="font-mono text-2xl text-[#EC4899]">24/7</div>
                                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Drop Alerts</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="relative animate-float">
                            <div className="absolute -inset-2 bg-gradient-to-br from-[#7C3AED]/30 via-transparent to-[#06B6D4]/30 blur-2xl" />
                            <img src="https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png"
                                 alt="Neon collectible"
                                 className="relative w-full aspect-[3/4] object-cover border border-[#7C3AED]/30" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden py-6 bg-black border-y border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C3AED]/5 via-transparent to-transparent pointer-events-none" />
                {/* OVERRIDE THE CSS ANIMATION SPEED RIGHT HERE */}
                <div className="flex marquee-track whitespace-nowrap items-center" style={{ animationDuration: "12s" }}>
                    {[...ANIME_TICKERS, ...ANIME_TICKERS, ...ANIME_TICKERS].map((a, i) => (
                        <div key={i} className="flex items-center gap-8 px-8 group cursor-default">
                            <span 
                                className="font-heading text-4xl md:text-5xl uppercase tracking-tighter text-transparent hover:text-white transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0)] hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.6)]" 
                                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}
                            >
                                {a}
                            </span>
                            <span className="text-[#06B6D4] opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
                                </svg>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="categories-section">
                <SectionHeader kicker="" title="Featured Collections" link="/shop" />
                <div className="grid grid-cols-12 grid-rows-2 gap-3 sm:gap-4 h-[600px] sm:h-[500px]">
                    {categories[0] ? (
                        <Link to={`/shop?category=${categories[0].slug}`} className="col-span-12 sm:col-span-6 row-span-2 relative group overflow-hidden border border-white/5 hover:border-[#06B6D4] transition-colors bg-black">
                            <img src={gunDevil} alt={categories[0].name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 w-full">
                                <div className="font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2">01</div>
                                <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-white mb-2">{categories[0].name}</h3>
                                <p className="text-zinc-400 text-sm max-w-xs mb-4">{categories[0].description}</p>
                                <div className="inline-flex items-center gap-2 text-[#7C3AED] font-heading uppercase tracking-widest text-xs group-hover:gap-3 transition-all">
                                    Explore <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link to="/shop" className="col-span-12 sm:col-span-6 row-span-2 relative group overflow-hidden border border-white/5 hover:border-[#06B6D4] transition-colors bg-black">
                            <img src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop" alt="Complete Collection" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/60 via-[#050505]/40 to-transparent" />
                            <div className="absolute inset-0 scanlines opacity-40" />
                            <div className="absolute bottom-0 left-0 p-6 sm:p-8 z-10 w-full">
                                <div className="font-mono text-xs text-[#06B6D4] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
                                    </svg>
                                    SYSTEM OVERRIDE
                                </div>
                                <h3 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-white mb-2">COMPLETE <br/>COLLECTION</h3>
                                <p className="text-zinc-300 text-sm max-w-xs mb-6 font-body">Access the entire database of premium anime artifacts. All tiers unlocked.</p>
                                <div className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:bg-[#06B6D4] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    Access Grid <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {[0, 1, 2, 3].map((index) => {
                        const c = categories[index + 1];
                        if (c) {
                            return (
                                <Link key={c.slug} to={`/shop?category=${c.slug}`} className="col-span-6 sm:col-span-3 row-span-1 relative group overflow-hidden border border-white/10 hover:border-[#06B6D4] transition-colors bg-black" data-testid={`cat-card-${c.slug}`}>
                                    <img src={gojo} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
                                        <div className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest mb-1">0{index + 2}</div>
                                        <h3 className="font-heading text-lg sm:text-xl uppercase tracking-tight text-white">{c.name}</h3>
                                    </div>
                                </Link>
                            );
                        } else {
                            const fb = fallbacks[index];
                            const Icon = fb.icon;
                            return (
                                <Link to={fb.link} key={`fallback-${index}`} className="col-span-6 sm:col-span-3 row-span-1 relative group overflow-hidden border border-white/5 bg-[#050505] hover:border-[#06B6D4]/50 transition-colors cursor-pointer">
                                    <img src={fb.img} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 mix-blend-luminosity grayscale group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#06B6D4]/20 via-[#050505]/80 to-transparent" />
                                    <div className="absolute inset-0 scanlines opacity-30" />
                                    <div className="absolute inset-0 p-5 z-10 flex flex-col justify-end">
                                        <div className="font-mono text-[10px] text-[#06B6D4] uppercase tracking-widest mb-2 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                                            <Icon className="w-3.5 h-3.5" /> {fb.kicker}
                                        </div>
                                        <h3 className="font-heading text-xl sm:text-2xl uppercase tracking-tight text-white group-hover:text-[#06B6D4] transition-colors">{fb.title}</h3>
                                    </div>
                                </Link>
                            );
                        }
                    })}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="trending-section">
                <SectionHeader kicker="" title={<><Flame className="inline w-8 h-8 mr-2 text-[#EC4899]" strokeWidth={1.5} />Trending Now</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {trending.slice(0, 4).map(p => <ProductCard key={p._id || p.id} product={p} />)}
                </div>
            </section>

            {mainFeature && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <FeaturedProduct product={mainFeature} />
                </section>
            )}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="bestsellers-section">
                <SectionHeader kicker="" title={<><Star className="inline w-8 h-8 mr-2 text-[#06B6D4]" strokeWidth={1.5} />Best Sellers</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {bestSellers.slice(0, 4).map(p => <ProductCard key={p._id || p.id} product={p} />)}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="newarrivals-section">
                <SectionHeader kicker="" title={<><svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2 text-[#7C3AED]"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" /></svg>New Arrivals</>} link="/shop" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {newArrivals.slice(0, 8).map(p => <ProductCard key={p._id || p.id} product={p} />)}
                </div>
            </section>
        </main>
    );
}