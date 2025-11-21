import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import type { Comment, Post } from "../../store/types";

interface CommentListProps {
    commentsMap: Record<string, Comment[]>;
    posts: Post[];
    onDelete: (commentId: string, postId: string) => void;
    loading: boolean;
}

export default function CommentList({ commentsMap, posts, onDelete, loading }: CommentListProps) {
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const allComments = Object.entries(commentsMap).flatMap(([postId, comments]) =>
        comments.map((comment) => ({ postId, comment }))
    );

    const toggleComment = (id: string) => {
        setExpandedComments((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">All Comments</h2>
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="ml-2 text-gray-600">Loading comments...</span>
                </div>
            ) : allComments.length > 0 ? (
                <div className="space-y-4">
                    {allComments.map(({ postId, comment }) => (
                        <div
                            key={comment._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-semibold text-gray-900">
                                            {comment.username}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">
                                            on{" "}
                                            <span className="font-medium">
                                                {posts.find((p) => p._id === postId)?.title || "Unknown"}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="text-gray-700">
                                        {expandedComments[comment._id]
                                            ? comment.text
                                            : `${comment.text.slice(0, 100)}${comment.text.length > 100 ? "..." : ""}`}
                                    </p>
                                    {comment.text.length > 100 && (
                                        <button
                                            onClick={() => toggleComment(comment._id)}
                                            className="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
                                        >
                                            {expandedComments[comment._id] ? "Show Less" : "Show More"}
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDelete(comment._id, postId)}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">No comments to display.</p>
            )}
        </div>
    );
}