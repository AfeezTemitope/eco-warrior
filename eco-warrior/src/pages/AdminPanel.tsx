import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import api from "../lib/api";
import { Pencil, Trash2, UserMinus, Loader2, Plus } from "lucide-react";
import AdminLogin from "../components/AdminLogin";

interface Admin {
    id: string;
    username: string;
    role: string;
}

interface Comment {
    _id: string;
    post_id: string;
    author_id: string;
    text: string;
    created_at: Date;
}

export default function AdminPanel() {
    const { session, role, loading: authLoading } = useAuthStore();
    const { posts, loadPosts } = usePostStore();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Post creation form states
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostDescription, setNewPostDescription] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [createPostLoading, setCreatePostLoading] = useState(false);
    const [createPostError, setCreatePostError] = useState("");

    // Admin creation form states
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminUsername, setNewAdminUsername] = useState("");
    const [createAdminLoading, setCreateAdminLoading] = useState(false);
    const [createAdminError, setCreateAdminError] = useState("");

    // State for toggling full comment text
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

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
            if (role === "superadmin") {
                fetchAdmins();
            }
        }
    }, [isAdmin, role, loadPosts]);

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

    const loadAllComments = async () => {
        setLoading(true);
        setError("");
        try {
            const allCommentsPromises = posts.map((post) =>
                api.get(`/comments/post/${post.id}`).then((res) => ({
                    postId: post.id,
                    comments: res.data,
                }))
            );
            const allComments = await Promise.all(allCommentsPromises);
            const map: Record<string, Comment[]> = {};
            allComments.forEach((item) => {
                map[item.postId] = item.comments;
            });
            setCommentsMap(map);
        } catch {
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setLoading(true);
        setError("");
        try {
            await api.delete(`/posts/${postId}`);
            loadPosts();
            loadAllComments();
        } catch {
            setError("Failed to delete post");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string, postId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        setLoading(true);
        setError("");
        try {
            await api.delete(`/comments/${commentId}`);
            setCommentsMap((prev) => ({
                ...prev,
                [postId]: prev[postId].filter((c) => c._id !== commentId),
            }));
        } catch {
            setError("Failed to delete comment");
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

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostTitle || !newPostDescription || !newPostContent) {
            setCreatePostError("Title, description, and content are required");
            return;
        }
        setCreatePostLoading(true);
        setCreatePostError("");
        try {
            const formData = new FormData();
            formData.append("title", newPostTitle);
            formData.append("description", newPostDescription);
            formData.append("content", newPostContent);
            if (newPostImage) {
                formData.append("image", newPostImage);
            }
            await api.post("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            loadPosts();
            setNewPostTitle("");
            setNewPostDescription("");
            setNewPostContent("");
            setNewPostImage(null);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error && 'response' in err
                ? (err as any).response?.data?.error || "Failed to create post"
                : "Failed to create post";
            setCreatePostError(errorMsg);
        } finally {
            setCreatePostLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail || !newAdminPassword || !newAdminUsername) {
            setCreateAdminError("All fields are required");
            return;
        }
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
        } catch (err: unknown) {
            const errorMsg = err instanceof Error && 'response' in err
                ? (err as any).response?.data?.error || "Failed to create admin"
                : "Failed to create admin";
            setCreateAdminError(errorMsg);
        } finally {
            setCreateAdminLoading(false);
        }
    };

    const toggleComment = (commentId: string) => {
        setExpandedComments((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    if (isCheckingAuth || authLoading) {
        return <div className="text-center py-8">Checking admin access...</div>;
    }

    if (!isAdmin) {
        return <AdminLogin />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Admin Panel
                </h1>
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
                )}

                {/* Manage Posts and Comments */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        Manage Posts and Comments
                    </h2>
                    {/* Create Post Form */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Create New Post</h3>
                        <form onSubmit={handleCreatePost} className="space-y-2">
                            <input
                                type="text"
                                placeholder="Title"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="w-full p-2 border rounded"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={newPostDescription}
                                onChange={(e) => setNewPostDescription(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={3}
                                required
                            />
                            <textarea
                                placeholder="Content"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={5}
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                                className="w-full p-2 border rounded"
                            />
                            {createPostError && (
                                <div className="bg-red-50 text-red-600 p-2 rounded">{createPostError}</div>
                            )}
                            <button
                                type="submit"
                                disabled={createPostLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                {createPostLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={20} />}
                                Create Post
                            </button>
                        </form>
                    </div>
                    {/* Posts List */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post.id} className="border-b pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <h3
                                            className="text-lg font-medium text-[#2E7D32] hover:text-green-700 cursor-pointer"
                                            onClick={() => navigate(`/posts/${post.id}`)}
                                        >
                                            {post.title}
                                        </h3>
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
                                            disabled={loading || (role === "admin" && post.author_id !== session?.user?.id)}
                                            className={`text-red-600 hover:text-red-800 flex items-center gap-2 ${
                                                role === "admin" && post.author_id !== session?.user?.id ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                                        Comments ({commentsMap[post.id]?.length || 0})
                                    </h4>
                                    <div className="space-y-2">
                                        {commentsMap[post.id]?.map((comment) => (
                                            <div
                                                key={comment._id}
                                                className="flex justify-between items-start border-t py-2 text-sm"
                                            >
                                                <p
                                                    className="text-gray-700 cursor-pointer hover:text-gray-900"
                                                    onClick={() => toggleComment(comment._id)}
                                                >
                                                    {expandedComments[comment._id] ? comment.text : comment.text.slice(0, 100) + (comment.text.length > 100 ? "..." : "")}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id, post.id)}
                                                    disabled={loading || (role === "admin" && comment.author_id !== session?.user?.id && post.author_id !== session?.user?.id)}
                                                    className={`text-red-600 hover:text-red-800 flex items-center gap-2 ${
                                                        role === "admin" && comment.author_id !== session?.user?.id && post.author_id !== session?.user?.id ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                >
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {!commentsMap[post.id]?.length && (
                                            <p className="text-gray-500">No comments yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Manage Admins (Superadmin only) */}
                {role === "superadmin" && (
                    <section className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Manage Admins
                        </h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2">Create New Admin</h3>
                            <form onSubmit={handleCreateAdmin} className="space-y-2">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newAdminUsername}
                                    onChange={(e) => setNewAdminUsername(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                {createAdminError && (
                                    <div className="bg-red-50 text-red-600 p-2 rounded">{createAdminError}</div>
                                )}
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
        </div>
    );
}