import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import api from '../lib/api';
import { FaHandPaper, FaRegHandPaper } from 'react-icons/fa';
import AuthModal from './AuthModal';
import type { Post, Comment, PostFromApi } from '../store/types';

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

    if (loading) return <div className="text-center py-8" aria-live="polite">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500" role="alert">{error}</div>;
    if (!post) return <div className="text-center py-8" role="alert">Post not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/')}
                    className="mb-4 text-[#2E7D32] hover:text-green-700 font-medium"
                    aria-label="Back to home"
                >
                    ← Back to Home
                </button>
                <article className="bg-white rounded-lg shadow-sm p-6">
                    {post.image_url && (
                        <div className="w-full h-[360px] overflow-hidden rounded-lg mb-6">
                            <img
                                loading="lazy"
                                src={post.image_url}
                                alt={post.title}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.jpg';
                                }}
                            />
                        </div>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                                {post.profiles.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{post.profiles.username}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-6">{post.description}</p>
                    <div
                        className="prose max-w-none text-gray-800 mb-6"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex items-center gap-4 border-t pt-4">
                        <button
                            onClick={handleClap}
                            disabled={interactionLoading || commentLoading}
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
                        {clapError && (
                            <p className="text-red-500 text-sm" role="alert">
                                {clapError}
                            </p>
                        )}
                    </div>
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comments</h2>
                        {interactions.comments.length === 0 ? (
                            <p className="text-gray-600">No comments yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {interactions.comments.map((comment: Comment) => (
                                    <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 bg-[#2E7D32] rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">
                                                  {(comment.username?.charAt(0).toUpperCase() || "U")}
                                                </span>
                                                <p className="font-medium text-sm">{comment.username || "Unknown User"}</p>

                                            </div>
                                            <p className="font-medium text-sm">{comment.username}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="text-gray-700">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add a Comment</h3>
                            {commentError && (
                                <p className="text-red-500 mb-2" role="alert">
                                    {commentError}
                                </p>
                            )}
                            {!session ? (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="text-[#2E7D32] hover:text-green-700 font-medium"
                                    aria-label="Sign in to comment"
                                >
                                    Sign in to comment
                                </button>
                            ) : (
                                <form onSubmit={handleAddComment} className="space-y-4">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-lg resize-y min-h-[100px] focus:ring-2 focus:ring-green-500"
                                        placeholder="Write your comment here..."
                                        maxLength={500}
                                        required
                                        aria-label="Comment input"
                                        disabled={commentLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={commentLoading || !newComment.trim()}
                                        className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors"
                                        aria-label="Post comment"
                                    >
                                        {commentLoading ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </article>
            </div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} redirectPath={location.pathname} />
        </div>
    );
}