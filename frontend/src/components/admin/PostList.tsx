import { Pencil, Trash2 } from "lucide-react";
import type { Post } from "../../store/types";

interface PostListProps {
    posts: Post[];
    onEdit: (post: Post) => void;
    onDelete: (postId: string, postTitle: string) => void;
}

export default function PostList({ posts, onEdit, onDelete }: PostListProps) {
    // Helper function to strip HTML tags and get plain text
    const getPlainText = (html: string): string => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    // Helper function to truncate text while preserving some HTML
    const getTruncatedDescription = (description: string, maxLength: number = 100): string => {
        const plainText = getPlainText(description);

        if (plainText.length <= maxLength) {
            return description;
        }

        // If text is longer, truncate the plain text and return it
        return plainText.slice(0, maxLength) + "...";
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Posts</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Post
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {posts.map((post) => {
                        const truncatedDesc = getTruncatedDescription(post.description);
                        const isHtml = post.description.includes("<") && post.description.includes(">");

                        return (
                            <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {post.image_url && (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{post.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                    {isHtml ? (
                                        <div
                                            className="text-sm text-gray-600 max-w-xs line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: truncatedDesc }}
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-600 max-w-xs line-clamp-2">
                                            {truncatedDesc}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => onEdit(post)}
                                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(post._id, post.title)}
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