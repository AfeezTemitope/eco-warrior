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
    Pencil,
} from "lucide-react";
import AdminLogin from "../components/AdminLogin";
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

interface ErrorResponse {
    error?: string;
}

interface AxiosErrorWithData {
    response?: {
        data?: ErrorResponse;
    };
}

export default function AdminPanel() {
    const { session, role, loading: authLoading } = useAuthStore();
    const { posts, loadPosts } = usePostStore();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [activeTab, setActiveTab] = useState<"dashboard" | "posts" | "comments" | "admins">(
        "dashboard"
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check admin access
    useEffect(() => {
        const checkAdminAccess = async () => {
            if (authLoading) return;
            if (!session || !role) {
                setIsCheckingAuth(false);
                setIsAdmin(false);
                return;
            }
            if (["admin", "superadmin"].includes(role)) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                await useAuthStore.getState().signOut();
            }
            setIsCheckingAuth(false);
        };
        checkAdminAccess();
    }, [session, role, authLoading]);

    // Load data when admin is confirmed
    useEffect(() => {
        if (isAdmin) {
            loadPosts();
            if (posts.length > 0) {
                loadAllComments();
            }
            if (role === "superadmin") {
                fetchAdmins();
            }
        }
    }, [isAdmin, role, posts.length, loadPosts]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<Admin[]>("/admin/admins");
            setAdmins(data);
        } catch (err) {
            const errorMsg =
                (err as AxiosErrorWithData).response?.data?.error || "Failed to load admins";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadAllComments = async () => {
        setLoading(true);
        try {
            const allCommentsPromises = posts.map((post) =>
                api.get<Comment[]>(`/comments/post/${post._id}`).then((res) => ({
                    postId: post._id,
                    comments: res.data,
                }))
            );
            const allComments = await Promise.all(allCommentsPromises);
            const map: Record<string, Comment[]> = {};
            allComments.forEach((item) => {
                map[item.postId] = item.comments;
            });
            setCommentsMap(map);
        } catch (err) {
            toast.error("Failed to load comments");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: string, postTitle: string) => {
        if (!confirm(`Delete post "${postTitle}"?`)) return;
        setLoading(true);
        try {
            await api.delete(`/posts/${postId}`);
            loadPosts();
            setCommentsMap((prev) => {
                const newMap = { ...prev };
                delete newMap[postId];
                return newMap;
            });
            toast.info(`Post "${postTitle}" deleted`);
        } catch {
            toast.error("Failed to delete post");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string, postId: string) => {
        if (!confirm("Delete this comment?")) return;
        setLoading(true);
        try {
            await api.delete(`/comments/${commentId}`);
            setCommentsMap((prev) => ({
                ...prev,
                [postId]: prev[postId].filter((c) => c._id !== commentId),
            }));
            toast.info("Comment deleted");
        } catch {
            toast.error("Failed to delete comment");
        } finally {
            setLoading(false);
        }
    };

    const startEditingPost = (post: Post) => {
        setEditingPost(post);
        setActiveTab("posts");
    };

    const handlePostSuccess = () => {
        setEditingPost(null);
        loadPosts();
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
    };

    // Show spinner while checking auth
    if (isCheckingAuth || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (!isAdmin) {
        return <AdminLogin />;
    }

    const totalComments = Object.values(commentsMap).reduce(
        (sum, cs) => sum + cs.length,
        0
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                                    {role}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-3 mb-8">
                    <TabButton
                        active={activeTab === "dashboard"}
                        onClick={() => setActiveTab("dashboard")}
                        icon={LayoutDashboard}
                    >
                        Dashboard
                    </TabButton>
                    <TabButton
                        active={activeTab === "posts"}
                        onClick={() => setActiveTab("posts")}
                        icon={FileText}
                    >
                        Manage Posts
                    </TabButton>
                    <TabButton
                        active={activeTab === "comments"}
                        onClick={() => setActiveTab("comments")}
                        icon={MessageSquare}
                    >
                        Manage Comments
                    </TabButton>
                    {role === "superadmin" && (
                        <TabButton
                            active={activeTab === "admins"}
                            onClick={() => setActiveTab("admins")}
                            icon={Users}
                        >
                            Manage Admins
                        </TabButton>
                    )}
                </nav>

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="relative w-64 h-full bg-white shadow-2xl flex flex-col p-6">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="self-end mb-8 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <nav className="flex flex-col gap-2">
                                <TabButton
                                    active={activeTab === "dashboard"}
                                    onClick={() => {
                                        setActiveTab("dashboard");
                                        setSidebarOpen(false);
                                    }}
                                    icon={LayoutDashboard}
                                >
                                    Dashboard
                                </TabButton>
                                <TabButton
                                    active={activeTab === "posts"}
                                    onClick={() => {
                                        setActiveTab("posts");
                                        setSidebarOpen(false);
                                    }}
                                    icon={FileText}
                                >
                                    Posts
                                </TabButton>
                                <TabButton
                                    active={activeTab === "comments"}
                                    onClick={() => {
                                        setActiveTab("comments");
                                        setSidebarOpen(false);
                                    }}
                                    icon={MessageSquare}
                                >
                                    Comments
                                </TabButton>
                                {role === "superadmin" && (
                                    <TabButton
                                        active={activeTab === "admins"}
                                        onClick={() => {
                                            setActiveTab("admins");
                                            setSidebarOpen(false);
                                        }}
                                        icon={Users}
                                    >
                                        Admins
                                    </TabButton>
                                )}
                            </nav>
                        </div>
                    </div>
                )}

                {/* === TAB CONTENT === */}
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    title="Total Admins"
                                    value={admins.length}
                                    color="purple"
                                    icon={Users}
                                />
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Posts</h2>
                            <div className="space-y-4">
                                {posts.slice(0, 3).map((post) => (
                                    <div
                                        key={post._id}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {post.image_url && (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{post.title}</h3>
                                            <div
                                                className="text-sm text-gray-600 mt-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: post.description.slice(0, 100),
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => startEditingPost(post)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                ))}
                                {posts.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">
                                        No posts yet. Create your first post!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "posts" && (
                    <div className="space-y-6">
                        <PostForm
                            editingPost={editingPost}
                            onSuccess={handlePostSuccess}
                            onCancel={handleCancelEdit}
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
                        onDelete={handleDeleteComment}
                        loading={loading}
                    />
                )}

                {activeTab === "admins" && role === "superadmin" && (
                    <AdminList
                        admins={admins}
                        onRefresh={fetchAdmins}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}