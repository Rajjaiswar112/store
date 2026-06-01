import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Success from "./pages/Success";
import Admin from "./pages/Admin";
import AddProduct from "./pages/admin/AddProduct";
import Checkout from "./pages/Checkout";

function Shell() {
    const [cartOpen, setCartOpen] = useState(false);
    return (
        <div className="App min-h-screen bg-[#050505] text-white relative">
            <Navbar onCartOpen={() => setCartOpen(true)} />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                <Route path="/admin/add-product" element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            </Routes>
            <Footer />
            <Toaster position="bottom-right" theme="dark" toastOptions={{
                style: {
                    background: "rgba(10,10,15,0.95)",
                    border: "1px solid rgba(176,38,255,0.3)",
                    color: "#fff",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "14px",
                }
            }} />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <WishlistProvider>
                    <CartProvider>
                        <Shell />
                    </CartProvider>
                </WishlistProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;