import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import api from "../lib/api";
import {
    Loader2,
    Menu,
    X,
    LayoutDashboard,
    FileText,
    MessageSquare,
    Users,
} from "lucide-react";
import StatCard from "../components/admin/StatCard";
import TabButton from "../components/admin/TabButton";
import PostForm from "../components/admin/PostForm";
import PostList from "../components/admin/PostList";
import CommentList from "../components/admin/CommentList";
import AdminList from "../components/admin/AdminList";
import type { Comment, Post } from "../store/types";
import { toast } from "react-toastify";

interface Admin {
    id: string;
    username: string;
    role: string;
}

export default function AdminPanel() {
    const { user, role, loading: authLoading, initialized } = useAuthStore();
    const { posts, loadPosts } = usePostStore();

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [activeTab, setActiveTab] = useState<"dashboard" | "posts" | "comments" | "admins">("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // DEBUG 1: Auth state on mount & changes
    console.log("AdminPanel Render →", {
        initialized,
        authLoading,
        user: user ? { id: user.id, username: user.username, role: user.role } : null,
        role,
        tokenExists: !!localStorage.getItem("token"),
    });

    // DEBUG 2: Main auth check
    useEffect(() => {
        console.log("Auth check useEffect triggered", { initialized, authLoading, user, role });

        if (!initialized || authLoading) {
            console.log("Still initializing or loading auth...");
            return;
        }

        if (!user || !role) {
            console.log("No user or role → signing out");
            useAuthStore.getState().signOut();
            toast.error("Session expired. Please log in again.");
            return;
        }

        if (!["admin", "superadmin"].includes(role)) {
            console.log("Not admin/superadmin → signing out", { role });
            useAuthStore.getState().signOut();
            toast.error("Access denied. Admins only.");
            return;
        }

        console.log("Admin access granted! Loading posts...");
        loadPosts();
    }, [user, role, initialized, authLoading, loadPosts]);

    // DEBUG 3: Load extra data
    useEffect(() => {
        console.log("Secondary load effect →", { postsLength: posts.length, user: !!user, role });

        if (posts.length > 0 && user) {
            console.log("Loading comments for", posts.length, "posts...");
            loadAllComments();
        }
        if (role === "superadmin") {
            console.log("Superadmin detected → fetching admin list");
            fetchAdmins();
        }
    }, [posts, user, role]);

    const fetchAdmins = async () => {
        console.log("Fetching admins from /admin/admins...");
        setLoading(true);
        try {
            const { data } = await api.get<Admin[]>("/admin/admins");
            console.log("Admins fetched successfully:", data);
            setAdmins(data);
        } catch (err: any) {
            console.error("Failed to fetch admins:", err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const loadAllComments = async () => {
        console.log("Loading comments for all posts...");
        setLoading(true);
        try {
            const results = await Promise.all(
                posts.map(post =>
                    api.get<Comment[]>(`/comments/post/${post._id}`).then(res => {
                        console.log(`Comments loaded for post ${post._id}:`, res.data.length);
                        return { postId: post._id, comments: res.data };
                    })
                )
            );
            const map: Record<string, Comment[]> = {};
            results.forEach(r => map[r.postId] = r.comments);
            setCommentsMap(map);
            console.log("All comments loaded:", map);
        } catch (err: any) {
            console.error("Failed to load comments:", err.response?.data || err.message);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    // Rest of handlers (with logs)
    const handleDeletePost = async (postId: string, postTitle: string) => {
        if (!confirm(`Delete "${postTitle}"?`)) return;
        try {
            await api.delete(`/posts/${postId}`);
            console.log("Post deleted:", postId);
            loadPosts();
            toast.success("Post deleted");
        } catch (err: any) {
            console.error("Delete post failed:", err.response?.data);
            toast.error("Failed to delete post");
        }
    };

    const startEditingPost = (post: Post) => {
        console.log("Editing post:", post.title);
        setEditingPost(post);
        setActiveTab("posts");
    };

    // Loading state
    if (!initialized || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="animate-spin text-green-500" size={48} />
            </div>
        );
    }

    // if (!user || !["admin", "superadmin"].includes(role as string)) {
    //     console.log("Final safety check failed → redirecting");
    //     return null;
    // }

    const totalComments = Object.values(commentsMap).flat().length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        Welcome back, <span className="font-semibold text-green-600">{user.username}</span> ({role})
                    </div>
                </div>
            </header>

            <div className="flex">
                <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav className="p-4 space-y-2">
                        <TabButton active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} icon={LayoutDashboard}>Dashboard</TabButton>
                        <TabButton active={activeTab === "posts"} onClick={() => { setActiveTab("posts"); setSidebarOpen(false); }} icon={FileText}>Posts</TabButton>
                        <TabButton active={activeTab === "comments"} onClick={() => { setActiveTab("comments"); setSidebarOpen(false); }} icon={MessageSquare}>Comments</TabButton>
                        {role === "superadmin" && (
                            <TabButton active={activeTab === "admins"} onClick={() => { setActiveTab("admins"); setSidebarOpen(false); }} icon={Users}>Admins</TabButton>
                        )}
                    </nav>
                </aside>

                <main className="flex-1 p-6">
                    {activeTab === "dashboard" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard title="Total Posts" value={posts.length} color="blue" icon={FileText} />
                                <StatCard title="Total Comments" value={totalComments} color="green" icon={MessageSquare} />
                                {role === "superadmin" && <StatCard title="Admins" value={admins.length} color="purple" icon={Users} />}
                            </div>
                        </div>
                    )}

                    {activeTab === "posts" && (
                        <div className="space-y-6">
                            <PostForm editingPost={editingPost} onSuccess={() => { setEditingPost(null); loadPosts(); }} onCancel={() => setEditingPost(null)} />
                            <PostList posts={posts} onEdit={startEditingPost} onDelete={handleDeletePost} />
                        </div>
                    )}

                    {activeTab === "comments" && <CommentList commentsMap={commentsMap} posts={posts} onDelete={() => {}} loading={loading} />}
                    {activeTab === "admins" && role === "superadmin" && <AdminList admins={admins} onRefresh={fetchAdmins} loading={loading} />}
                </main>
            </div>
        </div>
    );
}