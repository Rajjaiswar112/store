import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { api } from "../lib/api";
import CheckoutForm from "../components/CheckoutForm";
import { useCart } from "../context/CartContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_your_key_here");

export default function Checkout() {
    const [clientSecret, setClientSecret] = useState("");
    const { cartItems, total } = useCart();

    useEffect(() => {
        const fetchSecret = async () => {
            try {
                const { data } = await api.post("/payment/create-intent", { items: cartItems });
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.error(error);
            }
        };
        if (cartItems?.length > 0) fetchSecret();
    }, [cartItems]);

    const appearance = {
        theme: 'night',
        variables: {
            fontFamily: 'Space Grotesk, sans-serif',
            colorText: '#ffffff',
            colorPrimary: '#06B6D4',
            colorBackground: '#0a0a0f',
            colorDanger: '#EC4899',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
        rules: {
            tabIconSelectedColor: '#06B6D4',
            InputBackgroundColor: 'rgba(255, 255, 255, 0.05)',
            InputBorderColor: 'rgba(255, 255, 255, 0.1)',
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 px-6 pb-20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-2xl mx-auto bg-[#0a0a0f]/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Secure Link</h1>
                <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-10">Encrypting transaction data...</p>
                
                {clientSecret ? (
                    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                        <CheckoutForm total={total} />
                    </Elements>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#06B6D4] font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Connection</p>
                    </div>
                )}
            </div>
        </div>
    );
}