import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import api from '../lib/api';
import { FaHandPaper, FaRegHandPaper } from 'react-icons/fa';
import { ArrowLeft, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import AuthModal from './AuthModal';
import type { Post, Comment, PostFromApi } from '../store/types';
import Footer from "./Footer.tsx";

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const { user, error: authError } = useAuthStore();
    const { getInteractions, addClap, removeClap, loadInteractions, addComment, refreshInteractions } = usePostStore();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [interactionLoading, setInteractionLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [clapError, setClapError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    useEffect(() => {
        if (id) {
            setInteractionLoading(true);
            refreshInteractions(id).finally(() => setInteractionLoading(false));
        }
    }, [user, id, refreshInteractions]);

    const fetchPost = useCallback(async () => {
        if (!id) {
            setError('Post ID is missing');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get<PostFromApi>(`/posts/${id}`);
            console.log('PostDetail API Response:', data);
            if (!data || !data._id) {
                console.warn('Invalid post data:', data);
                throw new Error('Post not found');
            }
            const normalizedPost: Post = {
                _id: data._id,
                title: data.title,
                description: data.description,
                content: data.content,
                image_url: data.image_url,
                author_id: data.author_id,
                created_at: data.created_at,
                profiles: { username: data.profiles?.username || 'eco warrior 🍀' },
            };
            setPost(normalizedPost);
            await loadInteractions(id);
        } catch (err) {
            console.error('Error loading post:', err);
            setError('Failed to load post. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id, loadInteractions]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const interactions = id ? getInteractions(id) : { claps: 0, userClapped: false, comments: [] as Comment[] };

    const handleClap = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        try {
            setClapError('');
            if (interactions.userClapped) {
                await removeClap(id!);
            } else {
                await addClap(id!);
            }
        } catch (err) {
            setClapError(err instanceof Error ? err.message : 'Failed to update clap');
            setTimeout(() => setClapError(''), 3000);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (!id) {
            setCommentError('Invalid post ID');
            return;
        }
        if (!newComment.trim()) {
            setCommentError('Comment cannot be empty');
            return;
        }
        if (newComment.length > 500) {
            setCommentError('Comment must be 500 characters or less');
            return;
        }
        setCommentLoading(true);
        setCommentError('');
        try {
            await addComment(id, {
                post_id: id,
                author_id: user.id,
                text: newComment.trim(),
            });
            setNewComment('');
        } catch (err) {
            setCommentError(err instanceof Error ? err.message : 'Failed to post comment. Please try again.');
            setTimeout(() => setCommentError(''), 3000);
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#2E7D32] animate-spin" />
                    <p className="text-gray-600 font-medium">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="text-center">
                    <div className="text-gray-400 text-5xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
                    <p className="text-gray-600 mb-6">The post you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Header Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#2E7D32] font-medium transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Stories</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Featured Image */}
                    {post.image_url && (
                        <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden bg-gray-100">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.jpg';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    )}

                    {/* Article Header */}
                    <div className="px-6 sm:px-10 lg:px-16 py-8 md:py-12">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Author & Meta Info */}
                        <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-200">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <span className="text-white font-bold text-xl">
                                    {post.profiles.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-lg">{post.profiles.username}</p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{interactions.comments.length} comments</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description (Plain Text Summary) */}
                        <p className="text-xl text-gray-700 mb-10 leading-relaxed italic border-l-4 border-green-200 pl-6 py-4 bg-green-50/30 rounded-r-lg">
                            {post.description}
                        </p>

                        {/* Main Content (Rich Text) */}
                        <div
                            className="prose prose-xl max-w-none text-gray-800 mb-12 leading-relaxed
                                prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mb-4
                                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                                prose-p:mb-6 prose-p:leading-relaxed prose-p:text-gray-700
                                prose-a:text-[#2E7D32] prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                prose-strong:font-bold prose-strong:text-gray-900
                                prose-em:italic prose-em:text-gray-800
                                prose-blockquote:border-l-4 prose-blockquote:border-[#2E7D32] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:bg-green-50 prose-blockquote:py-4 prose-blockquote:my-6
                                prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
                                prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
                                prose-li:mb-2 prose-li:text-gray-700
                                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                                prose-img:rounded-lg prose-img:shadow-md prose-img:my-8"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Interaction Bar */}
                        <div className="flex flex-wrap items-center gap-4 py-6 border-y border-gray-200 mb-10">
                            <button
                                onClick={handleClap}
                                disabled={interactionLoading || commentLoading}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md ${
                                    interactions.userClapped
                                        ? 'bg-gradient-to-r from-green-500 to-[#2E7D32] text-white hover:shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
                                } ${interactionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {interactionLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : interactions.userClapped ? (
                                    <FaHandPaper className="text-xl" />
                                ) : (
                                    <FaRegHandPaper className="text-xl" />
                                )}
                                <span className="text-lg font-bold">{interactions.claps}</span>
                                <span className="hidden sm:inline">Claps</span>
                            </button>
                            {clapError && (
                                <p className="text-red-500 text-sm font-medium px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                                    {clapError}
                                </p>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="mt-12">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageCircle className="w-7 h-7 text-[#2E7D32]" />
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Comments ({interactions.comments.length})
                                </h2>
                            </div>

                            {/* Comment List */}
                            {interactions.comments.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg font-medium">No comments yet</p>
                                    <p className="text-gray-500 text-sm mt-2">Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mb-10">
                                    {interactions.comments.map((comment: Comment) => (
                                        <div key={comment._id} className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl border border-gray-200 transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-[#2E7D32] to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                                    <span className="text-white text-sm font-bold">
                                                        {comment.username?.charAt(0).toUpperCase() || "U"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold text-gray-900">{comment.username || "Unknown User"}</p>
                                                        <span className="text-gray-400">•</span>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comment Form */}
                            <div className="mt-10 pt-8 border-t-2 border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Share Your Thoughts</h3>
                                {commentError && (
                                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                        <p className="text-red-700 font-medium">{commentError}</p>
                                    </div>
                                )}
                                {!user ? (
                                    <div className="text-center py-10 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-gray-200">
                                        <MessageCircle className="w-12 h-12 text-[#2E7D32] mx-auto mb-4" />
                                        <p className="text-gray-700 text-lg mb-4">Join the conversation!</p>
                                        <button
                                            onClick={() => setShowAuthModal(true)}
                                            className="px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-green-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                                        >
                                            Sign In to Comment
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleAddComment} className="space-y-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="w-full p-5 border-2 border-gray-300 rounded-xl resize-none min-h-[140px] focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-[#2E7D32] transition-all bg-white text-gray-800 placeholder-gray-400"
                                            placeholder="What are your thoughts? Share your insights..."
                                            maxLength={500}
                                            required
                                            disabled={commentLoading}
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500 font-medium">
                                                {newComment.length}/500 characters
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={commentLoading || !newComment.trim()}
                                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-green-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all"
                                            >
                                                {commentLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>Posting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <MessageCircle className="w-5 h-5" />
                                                        <span>Post Comment</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectPath={location.pathname} />
            <Footer />
        </div>
    );
}