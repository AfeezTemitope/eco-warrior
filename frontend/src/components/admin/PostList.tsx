import { Pencil, Trash2 } from "lucide-react";
import type { Post } from "../../store/types";

interface PostListProps {
    posts: Post[];
    onEdit: (post: Post) => void;
    onDelete: (postId: string, postTitle: string) => void;
}

export default function PostList({ posts, onEdit, onDelete }: PostListProps) {
    const getTruncatedText = (text: string, maxLength: number = 100): string => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
    };

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">All Posts</h2>
                <p className="text-gray-500 text-center py-8">No posts yet. Create your first one above.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Posts</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Post
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Description
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => {
                        const truncatedDesc = getTruncatedText(post.description);
                        return (
                            <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {post.image_url && (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 truncate max-w-[140px] sm:max-w-none">
                                                {post.title}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                    <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                                        {truncatedDesc}
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => onEdit(post)}
                                            aria-label={`Edit ${post.title}`}
                                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(post._id, post.title)}
                                            aria-label={`Delete ${post.title}`}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
