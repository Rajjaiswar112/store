const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product"); 

const createPaymentIntent = async (req, res) => {
    try {
        const { items } = req.body;
        
        let totalAmount = 0;
        
        for (const item of items) {
            const productId = item.product?._id || item.product?.id || item.product_id || item._id; 
            
            if (productId) {
                const product = await Product.findById(productId);
                if (product) {
                    totalAmount += product.price * item.quantity;
                }
            }
        }

        if (totalAmount === 0) {
            return res.status(400).json({ detail: "Cart total is zero or items not found" });
        }

        const amountInPaise = Math.round(totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: "inr",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Stripe Intent Error:", error);
        res.status(500).json({ detail: error.message });
    }
};

module.exports = { createPaymentIntent };