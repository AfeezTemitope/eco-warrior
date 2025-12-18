import { FaHandPaper, FaRegHandPaper, FaComment, FaShareAlt, FaWhatsapp, FaTwitter, FaFacebook, FaLink } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    const [showShareModal, setShowShareModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState('');
    const [interactionLoading, setInteractionLoading] = useState(true);
    const { user } = useAuthStore();
    const { getInteractions, addClap, removeClap, loadInteractions } = usePostStore();

    useEffect(() => {
        if (post._id) {
            setInteractionLoading(true);
            loadInteractions(post._id).finally(() => setInteractionLoading(false));
        }
    }, [post._id, user, loadInteractions]);

    const interactions = getInteractions(post._id);
    const postUrl = `${window.location.origin}/posts/${post._id}`;

    const handleClap = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Fixed: check user instead of user
        if (!user) {
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

    const handleShare = (platform: string) => {
        const text = `Check out: ${post.title}`;
        const urls: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(postUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group">
                <a href={`/posts/${post._id}`} className="block">
                    {post.image_url && (
                        <div className="aspect-video overflow-hidden bg-gray-100">
                            <img
                                loading="lazy"
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}
                    <div className="p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#2E7D32] transition-colors line-clamp-2">
                            {post.title}
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{post.description}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#2E7D32] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                    {post.author.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-xs">{post.author.username}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </a>
                {error && (
                    <div className="px-5 pb-2 text-red-500 text-sm" role="alert">
                        {error}
                    </div>
                )}
                <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClap}
                            disabled={interactionLoading}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
                                interactions.userClapped
                                    ? 'bg-green-50 text-green-600'
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
                            <span className="font-medium">{interactions.claps}</span>
                        </button>
                        <a
                            href={`/posts/${post._id}`}
                            onClick={handleCommentClick}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-all duration-200 hover:scale-105"
                            aria-label={`View ${interactions.comments.length} comments`}
                        >
                            <FaComment className="text-sm" />
                            <span className="font-medium">{interactions.comments.length}</span>
                        </a>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowShareModal(true);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-all duration-200 hover:scale-105"
                            aria-label="Share post"
                        >
                            <FaShareAlt className="text-sm" />
                        </button>
                    </div>
                    <a
                        href={`/posts/${post._id}`}
                        className="text-[#2E7D32] hover:text-green-700 text-sm font-medium transition-colors"
                        aria-label="Read more"
                    >
                        Read →
                    </a>
                </div>
            </article>

            {/* Share Modal */}
            {showShareModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    onClick={() => setShowShareModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Share Post</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <FaWhatsapp className="text-white text-xl" />
                                </div>
                                <span className="text-xs text-gray-600">WhatsApp</span>
                            </button>

                            <button
                                onClick={() => handleShare('twitter')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                                    <FaTwitter className="text-white text-xl" />
                                </div>
                                <span className="text-xs text-gray-600">Twitter</span>
                            </button>

                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                                    <FaFacebook className="text-white text-xl" />
                                </div>
                                <span className="text-xs text-gray-600">Facebook</span>
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                    <FaLink className="text-white text-xl" />
                                </div>
                                <span className="text-xs text-gray-600">
                                    {copySuccess ? 'Copied!' : 'Copy'}
                                </span>
                            </button>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={postUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                    {copySuccess ? '✓' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectPath={`/posts/${post._id}`} />
        </>
    );
}

export default BlogPostCard;