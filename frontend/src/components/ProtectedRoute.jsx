import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading || user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-neon-purple font-heading uppercase tracking-widest text-sm" data-testid="loading-state">
                    Initializing...
                </div>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }
    return children;
}
