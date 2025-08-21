import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import api from "../lib/api";
import AuthModal from "../components/AuthModal";
import { Pencil, Trash2, UserMinus } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Admin {
    id: string;
    username: string;
    role: string;
}

export default function AdminPanel() {
    const { session, user, loading: authLoading } = useAuthStore();
    const { posts, loadPosts } = usePostStore();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!session) {
                setShowAuthModal(true); // show login form if unauthenticated
                return;
            }

            // Redirect ordinary users to their dashboard
            const role = user?.user_metadata?.role;
            if (role !== "admin" && role !== "superadmin") {
                navigate("/"); // ordinary user route
                return;
            }

            loadPosts();
            if (role === "superadmin") fetchAdmins();
        }
    }, [session, user, authLoading, navigate, loadPosts]);

    const fetchAdmins = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/admin/admins");
            setAdmins(data);
        } catch {
            setError("Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAuthModal = () => {
        setShowAuthModal(false);
        if (!session) navigate("/"); // fallback if login not successful
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setLoading(true);
        setError("");
        try {
            await api.delete(`/posts/${postId}`);
            loadPosts();
        } catch {
            setError("Failed to delete post");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("Are you sure you want to delete this admin?")) return;
        setLoading(true);
        setError("");
        try {
            await api.delete(`/admin/admins/${adminId}`);
            fetchAdmins();
        } catch {
            setError("Failed to delete admin");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="text-center py-8">Loading...</div>;

    if (!session)
        return <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />;

    // --- AdminPanel UI ---
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Admin Panel
                </h1>
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
                )}

                {/* Manage Posts */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Manage Posts
                    </h2>
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div>
                                    <h3 className="text-lg font-medium">{post.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {post.description.slice(0, 100)}...
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/posts/${post.id}`)}
                                        className="text-[#2E7D32] hover:text-green-700"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        disabled={loading}
                                        className="text-red-600 hover:text-red-800 flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Manage Admins for Superadmin */}
                {user?.user_metadata?.role === "superadmin" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Manage Admins
                        </h2>
                        <div className="space-y-4">
                            {admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex justify-between items-center border-b py-2"
                                >
                                    <div>
                                        <p className="font-medium">{admin.username}</p>
                                        <p className="text-sm text-gray-600">{admin.role}</p>
                                    </div>
                                    {admin.role !== "superadmin" && (
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.id)}
                                            disabled={loading}
                                            className="text-red-600 hover:text-red-800 flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                            <UserMinus size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* AuthModal fallback */}
            <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />
        </div>
    );
}
