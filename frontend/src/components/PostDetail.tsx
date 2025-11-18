import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import api from '../lib/api';
import { FaHandPaper, FaRegHandPaper } from 'react-icons/fa';
import AuthModal from './AuthModal';
import type { Post, Comment, PostFromApi } from '../store/types';
// import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const { session, error: authError } = useAuthStore();
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
        // Refresh interactions when session changes or id changes
        if (id) {
            setInteractionLoading(true);
            refreshInteractions(id).finally(() => setInteractionLoading(false));
        }
    }, [session, id, refreshInteractions]);

    const fetchPost = useCallback(async () => {
        if (!id) {
            setError('Post ID is missing');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get<PostFromApi>(`/posts/${id}`);
            console.log('PostDetail API Response:', data); // Debug
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
        if (!session) {
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
        if (!session) {
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
                author_id: session.user.id,
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

    if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500" aria-live="polite">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500" role="alert">{error}</div>;
    if (!post) return <div className="flex items-center justify-center min-h-screen text-gray-500" role="alert">Post not found</div>;
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/*<Header />*/}
            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 inline-flex items-center gap-2 text-[#2E7D32] hover:text-green-700 font-semibold transition-colors text-sm"
                    aria-label="Back to home"
                >
                    ← Back to Home
                </button>

                <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {post.image_url && (
                        <div className="w-full aspect-video overflow-hidden bg-gray-100">
                            <img
                                loading="lazy"
                                src={post.image_url || "/placeholder.svg"}
                                alt={post.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.jpg';
                                }}
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-8 lg:p-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

                        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                            <div className="w-12 h-12 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                    {post.profiles.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base">{post.profiles.username}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <p className="text-lg text-gray-600 mt-6 mb-8 leading-relaxed">{post.description}</p>

                        <div
                            className="prose prose-lg max-w-none text-gray-700 mb-10 leading-relaxed
                                prose-headings:text-gray-900 prose-headings:font-bold
                                prose-p:mb-4 prose-p:leading-relaxed
                                prose-a:text-[#2E7D32] prose-a:hover:underline
                                prose-strong:font-semibold prose-strong:text-gray-900
                                prose-blockquote:border-l-4 prose-blockquote:border-[#2E7D32] prose-blockquote:pl-4 prose-blockquote:italic"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-b border-gray-200 py-6">
                            <button
                                onClick={handleClap}
                                disabled={interactionLoading || commentLoading}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                                    interactions.userClapped
                                        ? 'bg-green-100 text-[#2E7D32] hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${interactionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                aria-label={interactions.userClapped ? 'Remove clap' : 'Add clap'}
                            >
                                {interactionLoading ? (
                                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : interactions.userClapped ? (
                                    <FaHandPaper className="text-lg" />
                                ) : (
                                    <FaRegHandPaper className="text-lg" />
                                )}
                                <span className="font-semibold">{interactions.claps}</span>
                            </button>
                            {clapError && (
                                <p className="text-red-500 text-sm font-medium" role="alert">
                                    {clapError}
                                </p>
                            )}
                        </div>

                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
                            {interactions.comments.length === 0 ? (
                                <p className="text-gray-500 py-6">No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                                <div className="space-y-5">
                                    {interactions.comments.map((comment: Comment) => (
                                        <div key={comment._id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 bg-[#2E7D32] rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-semibold">
                                                        {comment.username?.charAt(0).toUpperCase() || "U"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{comment.username || "Unknown User"}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Thoughts</h3>
                                {commentError && (
                                    <p className="text-red-500 text-sm font-medium mb-4 p-3 bg-red-50 rounded-lg" role="alert">
                                        {commentError}
                                    </p>
                                )}
                                {!session ? (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2E7D32] text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                        aria-label="Sign in to comment"
                                    >
                                        Sign in to Comment
                                    </button>
                                ) : (
                                    <form onSubmit={handleAddComment} className="space-y-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="w-full p-4 border border-gray-300 rounded-lg resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-all bg-white"
                                            placeholder="Share your thoughts..."
                                            maxLength={500}
                                            required
                                            aria-label="Comment input"
                                            disabled={commentLoading}
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500">{newComment.length}/500</p>
                                            <button
                                                type="submit"
                                                disabled={commentLoading || !newComment.trim()}
                                                className="px-6 py-2.5 bg-[#2E7D32] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                                aria-label="Post comment"
                                            >
                                                {commentLoading ? 'Posting...' : 'Post Comment'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectPath={location.pathname} />
            <Footer />
        </div>
    );
}