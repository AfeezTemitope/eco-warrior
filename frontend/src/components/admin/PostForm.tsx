import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import api from "../../lib/api";
import { toast } from "react-toastify";
import type { Post } from "../../store/types";

interface PostFormProps {
    editingPost: Post | null;
    onSuccess: () => void;
    onCancel: () => void;
}

interface ErrorResponse {
    error?: string;
}

interface AxiosErrorWithData {
    response?: {
        data?: ErrorResponse;
    };
}

export default function PostForm({ editingPost, onSuccess, onCancel }: PostFormProps) {
    const [title, setTitle] = useState(editingPost?.title || "");
    const [description, setDescription] = useState(editingPost?.description || "");
    const [content, setContent] = useState(editingPost?.content || "");
    const [imageUrl, setImageUrl] = useState(editingPost?.image_url || "");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const submitRef = useRef(false);

    const handleSubmit = async () => {
        if (!title || !description || !content) {
            toast.error("Please fill all required fields");
            return;
        }

        if (submitRef.current) return;
        submitRef.current = true;
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("content", content);

        if (image) {
            formData.append("image", image);
        } else if (imageUrl) {
            formData.append("image_url", imageUrl);
        }

        try {
            if (editingPost) {
                await api.put(`/posts/${editingPost._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${title}" updated!`);
            } else {
                await api.post("/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(`Post "${title}" created!`);
            }

            setTitle("");
            setDescription("");
            setContent("");
            setImageUrl("");
            setImage(null);
            onSuccess();
        } catch (err) {
            const errorMsg =
                (err as AxiosErrorWithData).response?.data?.error || "Failed to save post";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
            submitRef.current = false;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
                {editingPost ? "Edit Post" : "Create New Post"}
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        placeholder="Enter post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description * (Rich Text)
                    </label>
                    <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Enter post description with formatting..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                    </label>
                    <textarea
                        placeholder="Enter full post content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Upload
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            setImage(e.target.files?.[0] || null);
                            setImageUrl("");
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Image URL
                    </label>
                    <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {editingPost ? "Update Post" : "Create Post"}
                    </button>
                    {editingPost && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}