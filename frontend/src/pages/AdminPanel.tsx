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
    LogOut,
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

type TabKey = "dashboard" | "posts" | "comments" | "admins";

const TAB_LABELS: Record<TabKey, string> = {
    dashboard: "Dashboard",
    posts: "Posts",
    comments: "Comments",
    admins: "Admins",
};

export default function AdminPanel() {
    const { user, role, loading: authLoading, initialized, signOut } = useAuthStore();
    const { posts, loadPosts } = usePostStore();

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth check
    useEffect(() => {
        if (!initialized || authLoading) return;

        if (!user || !role) {
            useAuthStore.getState().signOut();
            toast.error("Session expired. Please log in again.");
            return;
        }

        if (!["admin", "superadmin"].includes(role)) {
            useAuthStore.getState().signOut();
            toast.error("Access denied. Admins only.");
            return;
        }

        loadPosts();
    }, [user, role, initialized, authLoading, loadPosts]);

    // Load secondary data
    useEffect(() => {
        if (posts.length > 0 && user) {
            loadAllComments();
        }
        if (role === "superadmin") {
            fetchAdmins();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts, user, role]);

    // Lock body scroll when mobile sidebar open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    // Close sidebar on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<Admin[]>("/admin/admins");
            setAdmins(data);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const loadAllComments = async () => {
        setLoading(true);
        try {
            const results = await Promise.all(
                posts.map((post) =>
                    api
                        .get<Comment[]>(`/comments/post/${post._id}`)
                        .then((res) => ({ postId: post._id, comments: res.data }))
                )
            );
            const map: Record<string, Comment[]> = {};
            results.forEach((r) => (map[r.postId] = r.comments));
            setCommentsMap(map);
        } catch {
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: string, postTitle: string) => {
        if (!confirm(`Delete "${postTitle}"?`)) return;
        try {
            await api.delete(`/posts/${postId}`);
            loadPosts();
            toast.success("Post deleted");
        } catch {
            toast.error("Failed to delete post");
        }
    };

    const startEditingPost = (post: Post) => {
        setEditingPost(post);
        setActiveTab("posts");
        setSidebarOpen(false);
    };

    const selectTab = (tab: TabKey) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    if (!initialized || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="animate-spin text-green-500" size={48} />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const totalComments = Object.values(commentsMap).flat().length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={sidebarOpen}
                            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                            Admin Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px] md:max-w-none">
                            Welcome back,{" "}
                            <span className="font-semibold text-green-600">{user.username}</span>{" "}
                            <span className="text-gray-500">({role})</span>
                        </div>
                        <div className="sm:hidden flex items-center gap-1.5 text-xs">
                            <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                                {user.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-4rem)]">
                {/* Mobile drawer backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } flex flex-col`}
                    aria-label="Admin navigation"
                >
                    {/* Sidebar header (mobile only) */}
                    <div className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-gray-200 flex-shrink-0">
                        <span className="font-semibold text-gray-900">Menu</span>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close menu"
                            className="p-2 -mr-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* User block (mobile only) */}
                    <div className="lg:hidden px-4 py-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{role}</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        <TabButton
                            active={activeTab === "dashboard"}
                            onClick={() => selectTab("dashboard")}
                            icon={LayoutDashboard}
                        >
                            {TAB_LABELS.dashboard}
                        </TabButton>
                        <TabButton
                            active={activeTab === "posts"}
                            onClick={() => selectTab("posts")}
                            icon={FileText}
                        >
                            {TAB_LABELS.posts}
                        </TabButton>
                        <TabButton
                            active={activeTab === "comments"}
                            onClick={() => selectTab("comments")}
                            icon={MessageSquare}
                        >
                            {TAB_LABELS.comments}
                        </TabButton>
                        {role === "superadmin" && (
                            <TabButton
                                active={activeTab === "admins"}
                                onClick={() => selectTab("admins")}
                                icon={Users}
                            >
                                {TAB_LABELS.admins}
                            </TabButton>
                        )}
                    </nav>

                    {/* Sign out (mobile only) */}
                    <div className="lg:hidden p-3 border-t border-gray-200 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => {
                                signOut();
                                setSidebarOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-hidden">
                    <div className="lg:hidden mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {TAB_LABELS[activeTab]}
                        </h2>
                    </div>

                    {activeTab === "dashboard" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                <StatCard
                                    title="Total Posts"
                                    value={posts.length}
                                    color="blue"
                                    icon={FileText}
                                />
                                <StatCard
                                    title="Total Comments"
                                    value={totalComments}
                                    color="green"
                                    icon={MessageSquare}
                                />
                                {role === "superadmin" && (
                                    <StatCard
                                        title="Admins"
                                        value={admins.length}
                                        color="purple"
                                        icon={Users}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "posts" && (
                        <div className="space-y-6">
                            <PostForm
                                editingPost={editingPost}
                                onSuccess={() => {
                                    setEditingPost(null);
                                    loadPosts();
                                }}
                                onCancel={() => setEditingPost(null)}
                            />
                            <PostList
                                posts={posts}
                                onEdit={startEditingPost}
                                onDelete={handleDeletePost}
                            />
                        </div>
                    )}

                    {activeTab === "comments" && (
                        <CommentList
                            commentsMap={commentsMap}
                            posts={posts}
                            onDelete={() => {}}
                            loading={loading}
                        />
                    )}

                    {activeTab === "admins" && role === "superadmin" && (
                        <AdminList admins={admins} onRefresh={fetchAdmins} loading={loading} />
                    )}
                </main>
            </div>
        </div>
    );
}
