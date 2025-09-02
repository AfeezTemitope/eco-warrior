import {useEffect, useRef, useState} from "react";
// import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import api from "../lib/api";
import { Pencil, Trash2, UserMinus, Loader2, Plus } from "lucide-react";
import AdminLogin from "../components/AdminLogin";
import type {Comment, Post} from "../store/types";
import { toast } from "react-toastify"; // 👈 Add toast

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
    const [error, setError] = useState("");
    // const navigate = useNavigate();

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Post form states
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [newPostImageUrl, setNewPostImageUrl] = useState(""); // 👈 For direct URL input
    const [createPostLoading, setCreatePostLoading] = useState(false);
    const [createPostError, setCreatePostError] = useState("");

    // Edit mode
    const [editingPost, setEditingPost] = useState<Post | null>(null); // 👈 Track post being edited

    // Admin form
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminUsername, setNewAdminUsername] = useState("");
    const [createAdminLoading, setCreateAdminLoading] = useState(false);
    const [createAdminError, setCreateAdminError] = useState("");

    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<"dashboard" | "posts" | "comments" | "admins">("dashboard");

    // Prevent double-submit
    const submitPostRef = useRef(false);
    const submitAdminRef = useRef(false);

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

    useEffect(() => {
        if (isAdmin) {
            loadPosts();
            loadAllComments();
            if (role === "superadmin") fetchAdmins();
        }
    }, [isAdmin, role, loadPosts]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/admins");
            setAdmins(data);
        } catch (err) {
            const errorMsg = (err as AxiosErrorWithData).response?.data?.error || "Failed to load admins";
            setError(errorMsg);
            toast.error("Failed to load admins");
        } finally {
            setLoading(false);
        }
    };

    const loadAllComments = async () => {
        setLoading(true);
        try {
            const allCommentsPromises = posts.map((post) =>
                api.get(`/comments/post/${post._id}`).then((res) => ({
                    postId: post._id,
                    comments: res.data as Comment[],
                }))
            );
            const allComments = await Promise.all(allCommentsPromises);
            const map: Record<string, Comment[]> = {};
            allComments.forEach((item) => {
                map[item.postId] = item.comments;
            });
            setCommentsMap(map);
        } catch {
            toast.error("Failed to load comments");
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
            loadAllComments();
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

    // Handle Create or Update Post
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
            formData.append("image_url", newPostImageUrl); // 👈 Use URL if no file
        }

        try {
            if (editingPost) {
                // Update existing post
                await api.put(`/posts/${editingPost._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${newPostTitle}" updated!`);
                setEditingPost(null);
            } else {
                // Create new post
                await api.post("/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${newPostTitle}" created!`);
            }

            // Reset form
            setNewPostTitle("");
            setNewPostDescription("");
            setNewPostContent("");
            setNewPostImage(null);
            setNewPostImageUrl("");
            loadPosts();
        } catch (err: unknown) {
            const errorMsg = (err as AxiosErrorWithData).response?.data?.error || "Failed to save post";
            setCreatePostError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setCreatePostLoading(false);
            submitPostRef.current = false;
        }
    };

    // Populate form for editing
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
        } catch (err: unknown) {
            const errorMsg = (err as AxiosErrorWithData).response?.data?.error || "Failed to create admin";
            setCreateAdminError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setCreateAdminLoading(false);
            submitAdminRef.current = false;
        }
    };

    const toggleComment = (id: string) => {
        setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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

    const totalComments = Object.values(commentsMap).reduce((sum, cs) => sum + cs.length, 0);
    const allComments = Object.entries(commentsMap).flatMap(([postId, comments]) =>
        comments.map((comment) => ({ postId, comment }))
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">Role: {role}</p>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>
                )}

                <nav className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                        Dashboard
                    </button>
                    <button onClick={() => setActiveTab("posts")} className={`px-4 py-2 rounded ${activeTab === "posts" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                        Manage Posts
                    </button>
                    <button onClick={() => setActiveTab("comments")} className={`px-4 py-2 rounded ${activeTab === "comments" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                        Manage Comments
                    </button>
                    {role === "superadmin" && (
                        <button onClick={() => setActiveTab("admins")} className={`px-4 py-2 rounded ${activeTab === "admins" ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                            Manage Admins
                        </button>
                    )}
                </nav>

                {/* Dashboard */}
                {activeTab === "dashboard" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
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

                {/* Posts */}
                {activeTab === "posts" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Posts</h2>

                        {/* Create/Edit Form */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-2">{editingPost ? "Edit Post" : "Create New Post"}</h3>
                            <form onSubmit={handleSubmitPost} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newPostTitle}
                                    onChange={(e) => setNewPostTitle(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Description"
                                    value={newPostDescription}
                                    onChange={(e) => setNewPostDescription(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <textarea
                                    placeholder="Content"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    className="w-full p-2 border rounded h-32"
                                    required
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setNewPostImage(e.target.files?.[0] || null);
                                        setNewPostImageUrl("");
                                    }}
                                    className="w-full p-2 border rounded"
                                />
                                <input
                                    type="url"
                                    placeholder="Or enter image URL"
                                    value={newPostImageUrl}
                                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                                {createPostError && (
                                    <div className="bg-red-50 text-red-600 p-2 rounded">{createPostError}</div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={createPostLoading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                    >
                                        {createPostLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={20} />}
                                        {editingPost ? "Update Post" : "Create Post"}
                                    </button>
                                    {editingPost && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="bg-gray-500 text-white px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Posts Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {posts.map((post) => (
                                    <tr key={post._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {post.profiles?.username || "Anonymous"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => startEditingPost(post)}
                                                className="text-blue-600 hover:text-blue-800 mr-4"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post._id, post.title)}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {!posts.length && <p className="text-center text-gray-500 py-4">No posts found.</p>}
                        </div>
                    </section>
                )}

                {/* Comments */}
                {activeTab === "comments" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Comments</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th>Post Title</th>
                                    <th>Author</th>
                                    <th>Text</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {allComments.map(({ postId, comment }) => (
                                    <tr key={comment._id}>
                                        <td>{posts.find(p => p._id === postId)?.title || postId}</td>
                                        <td>{comment.author_id}</td>
                                        <td>
                                                <span onClick={() => toggleComment(comment._id)} className="cursor-pointer hover:underline">
                                                    {expandedComments[comment._id] ? comment.text : `${comment.text.slice(0, 100)}...`}
                                                </span>
                                        </td>
                                        <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteComment(comment._id, postId)}
                                                disabled={loading}
                                                className="text-red-600"
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

                {/* Admins */}
                {activeTab === "admins" && role === "superadmin" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Admins</h2>
                        <div className="mb-8">
                            <h3 className="text-lg font-medium mb-2">Create New Admin</h3>
                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <input type="email" placeholder="Email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full p-2 border rounded" required />
                                <input type="password" placeholder="Password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full p-2 border rounded" required />
                                <input type="text" placeholder="Username" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} className="w-full p-2 border rounded" required />
                                {createAdminError && <div className="bg-red-50 text-red-600 p-2 rounded">{createAdminError}</div>}
                                <button
                                    type="submit"
                                    disabled={createAdminLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                                >
                                    {createAdminLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={20} />}
                                    Create Admin
                                </button>
                            </form>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td>{admin.username}</td>
                                    <td>{admin.role}</td>
                                    <td>
                                        {admin.role !== "superadmin" && (
                                            <button
                                                onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                                                disabled={loading}
                                                className="text-red-600"
                                            >
                                                <UserMinus size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>
        </div>
    );
}