// frontend/src/lib/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, initialized, loading } = useAuthStore();
    const location = useLocation();

    // Still initializing auth state → show a clean spinner
    if (!initialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            </div>
        );
    }

    // Not logged in → go to admin login
    if (!user) {
        return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    // Logged in but not admin/superadmin → kick to home
    if (!['admin', 'superadmin'].includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // All good → show admin panel
    return <>{children}</>;
};

export default ProtectedRoute;