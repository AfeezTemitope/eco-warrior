// ProtectedRoute.tsx
import {type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AdminLogin from "../components/AdminLogin.tsx";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                navigate("/admin-login"); // redirect to login if no session
            }
            setLoading(false);
        };

        checkSession();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-lg">
                Loading...
            </div>
        );
    }

    return <>{isAuthenticated ? children : <AdminLogin />}</>;
}
