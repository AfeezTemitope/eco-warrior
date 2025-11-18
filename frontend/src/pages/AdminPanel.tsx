import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import api from "../lib/api";
import {
    Pencil,
    Trash2,
    UserMinus,
    Loader2,
    Plus,
    Menu,
    X,
} from "lucide-react";
import AdminLogin from "../components/AdminLogin";
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
    const [loading, setLoading] = useState(false); // Now properly used in JSX
    const [error, setError] = useState<string>("");

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Post form states
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [newPostImageUrl, setNewPostImageUrl] = useState("");
    const [createPostLoading, setCreatePostLoading] = useState(false);
    const [createPostError, setCreatePostError] = useState<string>("");

    // Edit mode
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    // Admin form
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminUsername, setNewAdminUsername] = useState("");
    const [createAdminLoading, setCreateAdminLoading] = useState(false);
    const [createAdminError, setCreateAdminError] = useState<string>("");

    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<"dashboard" | "posts" | "comments" | "admins">(
        "dashboard"
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Prevent double-submit
    const submitPostRef = useRef(false);
    const submitAdminRef = useRef(false);

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

    const handleDeleteAdmin = async (adminId: string, username: string) => {
        if (!confirm(`Delete admin "${username}"?`)) return;
        setLoading(true);
        try {
            await api.delete(`/admin/admins/${adminId}`);
            fetchAdmins();
            toast.info(`Admin "${username}" deleted`);
        } catch {
            toast.error("Failed to delete admin");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitPostRef.current) return;
        submitPostRef.current = true;
        setCreatePostLoading(true);
        setCreatePostError("");

        const formData = new FormData();
        formData.append("title", newPostTitle);
        formData.append("description", newPostDescription);
        formData.append("content", newPostContent);

        if (newPostImage) {
            formData.append("image", newPostImage);
        } else if (newPostImageUrl) {
            formData.append("image_url", newPostImageUrl);
        }

        try {
            if (editingPost) {
                await api.put(`/posts/${editingPost._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${newPostTitle}" updated!`);
                setEditingPost(null);
            } else {
                await api.post("/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${newPostTitle}" created!`);
            }

            setNewPostTitle("");
            setNewPostDescription("");
            setNewPostContent("");
            setNewPostImage(null);
            setNewPostImageUrl("");
            loadPosts();
        } catch (err) {
            const errorMsg =
                (err as AxiosErrorWithData).response?.data?.error || "Failed to save post";
            setCreatePostError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setCreatePostLoading(false);
            submitPostRef.current = false;
        }
    };

    const startEditingPost = (post: Post) => {
        setEditingPost(post);
        setNewPostTitle(post.title);
        setNewPostDescription(post.description);
        setNewPostContent(post.content);
        setNewPostImageUrl(post.image_url || "");
        setNewPostImage(null);
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setNewPostTitle("");
        setNewPostDescription("");
        setNewPostContent("");
        setNewPostImage(null);
        setNewPostImageUrl("");
        setCreatePostError("");
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitAdminRef.current) return;
        submitAdminRef.current = true;
        setCreateAdminLoading(true);
        setCreateAdminError("");

        try {
            await api.post("/admin/admins", {
                email: newAdminEmail,
                password: newAdminPassword,
                username: newAdminUsername,
            });
            fetchAdmins();
            setNewAdminEmail("");
            setNewAdminPassword("");
            setNewAdminUsername("");
            toast.success("Admin created!");
        } catch (err) {
            const errorMsg =
                (err as AxiosErrorWithData).response?.data?.error || "Failed to create admin";
            setCreateAdminError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setCreateAdminLoading(false);
            submitAdminRef.current = false;
        }
    };

    const toggleComment = (id: string) => {
        setExpandedComments((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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
    const allComments = Object.entries(commentsMap).flatMap(([postId, comments]) =>
        comments.map((comment) => ({ postId, comment }))
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-gray-600">Role: {role}</p>
                    </div>
                    {/* Mobile Hamburger */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded bg-blue-600 text-white"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>
                )}

                {/* Desktop Nav */}
                <nav className="hidden md:flex flex-wrap gap-2 mb-6">
                    {(["dashboard", "posts", "comments"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded ${
                                activeTab === tab
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {tab === "dashboard" && "Dashboard"}
                            {tab === "posts" && "Manage Posts"}
                            {tab === "comments" && "Manage Comments"}
                        </button>
                    ))}
                    {role === "superadmin" && (
                        <button
                            onClick={() => setActiveTab("admins")}
                            className={`px-4 py-2 rounded ${
                                activeTab === "admins"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            Manage Admins
                        </button>
                    )}
                </nav>

                {/* Mobile Sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 flex">
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="relative w-64 bg-white shadow-lg z-50 flex flex-col p-4">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="self-end mb-6 p-2 rounded bg-gray-200"
                            >
                                <X size={24} />
                            </button>
                            {(["dashboard", "posts", "comments"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setSidebarOpen(false);
                                    }}
                                    className={`px-4 py-2 rounded mb-2 text-left ${
                                        activeTab === tab
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                >
                                    {tab === "dashboard" && "Dashboard"}
                                    {tab === "posts" && "Manage Posts"}
                                    {tab === "comments" && "Manage Comments"}
                                </button>
                            ))}
                            {role === "superadmin" && (
                                <button
                                    onClick={() => {
                                        setActiveTab("admins");
                                        setSidebarOpen(false);
                                    }}
                                    className={`px-4 py-2 rounded mb-2 text-left ${
                                        activeTab === "admins"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                >
                                    Manage Admins
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* === TAB CONTENT === */}
                {activeTab === "dashboard" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <h3 className="text-lg font-medium text-blue-800">Total Posts</h3>
                                <p className="text-3xl font-bold text-blue-600">{posts.length}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <h3 className="text-lg font-medium text-green-800">Total Comments</h3>
                                <p className="text-3xl font-bold text-green-600">{totalComments}</p>
                            </div>
                            {role === "superadmin" && (
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <h3 className="text-lg font-medium text-purple-800">Total Admins</h3>
                                    <p className="text-3xl font-bold text-purple-600">{admins.length}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === "posts" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold mb-4">Manage Posts</h2>

                        {/* Post Form */}
                        <form
                            onSubmit={handleSubmitPost}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                        >
                            <input
                                type="text"
                                placeholder="Title"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="p-2 border rounded md:col-span-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newPostDescription}
                                onChange={(e) => setNewPostDescription(e.target.value)}
                                className="p-2 border rounded md:col-span-2"
                                required
                            />
                            <textarea
                                placeholder="Content"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="p-2 border rounded h-32 md:col-span-2"
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setNewPostImage(e.target.files?.[0] || null);
                                    setNewPostImageUrl("");
                                }}
                                className="p-2 border rounded"
                            />
                            <input
                                type="url"
                                placeholder="Or enter image URL"
                                value={newPostImageUrl}
                                onChange={(e) => setNewPostImageUrl(e.target.value)}
                                className="p-2 border rounded"
                            />
                            {createPostError && (
                                <div className="bg-red-50 text-red-600 p-2 rounded md:col-span-2">
                                    {createPostError}
                                </div>
                            )}
                            <div className="flex gap-2 md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={createPostLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                                >
                                    {createPostLoading && (
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                    )}
                                    {editingPost ? "Update Post" : "Create Post"}
                                </button>
                                {editingPost && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Post List */}
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Title</th>
                                    <th className="p-2 text-left hidden sm:table-cell">Description</th>
                                    <th className="p-2 text-left hidden md:table-cell">Content</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {posts.map((post) => (
                                    <tr key={post._id} className="border-t">
                                        <td className="p-2">{post.title}</td>
                                        <td className="p-2 hidden sm:table-cell">{post.description}</td>
                                        <td className="p-2 hidden md:table-cell">
                                            {post.content.slice(0, 50)}...
                                        </td>
                                        <td className="p-2 flex gap-2">
                                            <button
                                                onClick={() => startEditingPost(post)}
                                                className="p-1 bg-yellow-500 text-white rounded"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeletePost(post._id, post.title)
                                                }
                                                className="p-1 bg-red-600 text-white rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === "comments" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold mb-4">Manage Comments</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                                <span className="ml-2 text-gray-600">Loading comments...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allComments.length > 0 ? (
                                    allComments.map(({ postId, comment }) => (
                                        <div
                                            key={comment._id}
                                            className="border rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="text-gray-800">
                                                    <span className="font-semibold">
                                                        {comment.username}
                                                    </span>{" "}
                                                    on post{" "}
                                                    <span className="font-semibold">
                                                        {posts.find((p) => p._id === postId)?.title ||
                                                            "Unknown"}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600 mt-1">
                                                    {expandedComments[comment._id]
                                                        ? comment.text
                                                        : `${comment.text.slice(0, 50)}...`}
                                                </p>
                                                {comment.text.length > 50 && (
                                                    <button
                                                        onClick={() => toggleComment(comment._id)}
                                                        className="text-blue-600 text-sm mt-1"
                                                    >
                                                        {expandedComments[comment._id]
                                                            ? "Show Less"
                                                            : "Show More"}
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment._id, postId)}
                                                className="mt-2 sm:mt-0 p-2 bg-red-600 text-white rounded self-start sm:self-auto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No comments to display.</p>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === "admins" && role === "superadmin" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold mb-4">Manage Admins</h2>

                        {/* Create Admin Form */}
                        <form
                            onSubmit={handleCreateAdmin}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
                        >
                            <input
                                type="text"
                                placeholder="Username"
                                value={newAdminUsername}
                                onChange={(e) => setNewAdminUsername(e.target.value)}
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newAdminPassword}
                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                className="p-2 border rounded sm:col-span-2"
                                required
                            />
                            {createAdminError && (
                                <div className="bg-red-50 text-red-600 p-2 rounded sm:col-span-2">
                                    {createAdminError}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={createAdminLoading}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center sm:col-span-2"
                            >
                                {createAdminLoading && (
                                    <Loader2 size={18} className="animate-spin mr-2" />
                                )}
                                <Plus size={18} className="mr-2" /> Create Admin
                            </button>
                        </form>

                        {/* Admin List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                                <span className="ml-2 text-gray-600">Loading admins...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">Username</th>
                                        <th className="p-2 text-left hidden sm:table-cell">Email</th>
                                        <th className="p-2 text-left">Role</th>
                                        <th className="p-2 text-left">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {admins.length > 0 ? (
                                        admins.map((admin) => (
                                            <tr key={admin.id} className="border-t">
                                                <td className="p-2">{admin.username}</td>
                                                <td className="p-2 hidden sm:table-cell">{admin.id}</td>
                                                <td className="p-2">{admin.role}</td>
                                                <td className="p-2">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteAdmin(admin.id, admin.username)
                                                        }
                                                        className="p-1 bg-red-600 text-white rounded"
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-500">
                                                No admins found.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}