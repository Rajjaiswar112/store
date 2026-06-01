import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export default function CheckoutForm({ total }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order/success`,
            },
        });

        if (error) {
            toast.error(error.message);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl backdrop-blur-md">
                <PaymentElement />
            </div>
            <button
                disabled={isLoading || !stripe || !elements}
                type="submit"
                className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold uppercase tracking-widest text-sm rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Processing Link..." : `Initialize Payment (₹${total.toLocaleString('en-IN')})`}
                {!isLoading && <Zap className="w-4 h-4" />}
            </button>
        </form>
    );
}
