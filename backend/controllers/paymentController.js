const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product"); // Adjust path to your Product model if needed

const createPaymentIntent = async (req, res) => {
    try {
        const { items } = req.body;

        // 1. Calculate the exact total on the backend to prevent frontend tampering
        let totalAmount = 0;
        for (const item of items) {
            // Depending on how your cart is structured, it might be item.product or item._id
            const productId = item.product || item._id; 
            const product = await Product.findById(productId);
            
            if (product) {
                totalAmount += product.price * item.quantity;
            }
        }

        // 2. Stripe requires the amount in the smallest currency unit (Paise for INR)
        // Example: ₹3,500 becomes 350000 paise
        const amountInPaise = totalAmount * 100;

        // 3. Tell Stripe to create a secure payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: "inr",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // 4. Send the secret token back to the React frontend
        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Stripe Intent Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

module.exports = { createPaymentIntent };