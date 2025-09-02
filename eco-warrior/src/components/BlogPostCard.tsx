import { FaHandPaper, FaRegHandPaper, FaComment } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import AuthModal from './AuthModal';

export interface BlogPost {
    _id: string;
    title: string;
    description: string;
    image_url?: string;
    author: {
        id: string;
        username: string;
    };
    created_at: string;
}

interface BlogPostCardProps {
    post: BlogPost;
}

function BlogPostCard({ post }: BlogPostCardProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [error, setError] = useState('');
    const [interactionLoading, setInteractionLoading] = useState(true);
    const { requireAuth, session } = useAuthStore();
    const { getInteractions, addClap, removeClap, loadInteractions } = usePostStore();

    useEffect(() => {
        if (post._id) {
            setInteractionLoading(true);
            loadInteractions(post._id).finally(() => setInteractionLoading(false));
        }
    }, [post._id, session, loadInteractions]);

    const interactions = getInteractions(post._id);

    const handleClap = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!requireAuth()) {
            setShowAuthModal(true);
            return;
        }

        setError('');
        try {
            if (interactions.userClapped) {
                await removeClap(post._id);
            } else {
                await addClap(post._id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update clap');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                <a href={`/posts/${post._id}`} className="block">
                    {post.image_url && (
                        <div className="aspect-video overflow-hidden">
                            <img
                                loading="lazy"
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#2E7D32] transition-colors line-clamp-2">
                            {post.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{post.description}</p>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                    {post.author.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{post.author.username}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
                {error && (
                    <div className="px-6 pb-4 text-red-500 text-sm" role="alert">
                        {error}
                    </div>
                )}
                <div className="px-6 pb-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClap}
                            disabled={interactionLoading}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 ${
                                interactions.userClapped
                                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${interactionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={interactions.userClapped ? 'Remove clap' : 'Add clap'}
                        >
                            {interactionLoading ? (
                                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : interactions.userClapped ? (
                                <FaHandPaper className="text-green-500 text-sm" />
                            ) : (
                                <FaRegHandPaper className="text-sm" />
                            )}
                            <span className="font-medium text-sm">{interactions.claps}</span>
                        </button>
                        <a
                            href={`/posts/${post._id}`}
                            onClick={handleCommentClick}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
                            aria-label={`View ${interactions.comments.length} comments`}
                        >
                            <FaComment className="text-sm" />
                            <span className="font-medium text-sm">{interactions.comments.length}</span>
                        </a>
                    </div>
                    <a
                        href={`/posts/${post._id}`}
                        className="text-[#2E7D32] hover:text-green-700 text-sm font-medium transition-colors"
                        aria-label="Read more"
                    >
                        Read More
                    </a>
                </div>
            </article>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectPath={`/posts/${post._id}`} />
        </>
    );
}
export default BlogPostCard;