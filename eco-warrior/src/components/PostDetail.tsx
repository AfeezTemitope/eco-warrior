import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import api from '../lib/api';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import AuthModal from './AuthModal';

export default function PostDetail() {
    const { id } = useParams();
    const { session } = useAuthStore();
    const { getInteractions, addClap, removeClap, loadInteractions } = usePostStore();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/posts/${id}`);
                setPost(data);
                await loadInteractions(id!);
            } catch (err) {
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPost();
    }, [id, loadInteractions]);

    const interactions = id ? getInteractions(id) : { claps: 0, userClapped: false, comments: [] };

    const handleClap = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            setShowAuthModal(true);
            return;
        }
        if (interactions.userClapped) {
            await removeClap(id!);
        } else {
            await addClap(id!);
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-8">Post not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/')}
                    className="mb-4 text-[#2E7D32] hover:text-green-700 font-medium"
                >
                    ← Back to Home
                </button>
                <article className="bg-white rounded-lg shadow-sm p-6">
                    {post.image_url && (
                        <img
                            loading={'lazy'}
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-64 object-cover rounded-lg mb-6"
                            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                        />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {post.author_id?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">
                                {post.author_id?.username || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-6">{post.description}</p>
                    <div className="prose max-w-none text-gray-800 mb-6">{post.content}</div>
                    <div className="flex items-center gap-4 border-t pt-4">
                        <button
                            onClick={handleClap}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                                interactions.userClapped
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {interactions.userClapped ? (
                                <FaHeart className="text-red-500 text-sm" />
                            ) : (
                                <FaRegHeart className="text-sm" />
                            )}
                            <span className="font-medium text-sm">{interactions.claps}</span>
                        </button>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comments</h2>
                        {interactions.comments.length === 0 ? (
                            <p className="text-gray-600">No comments yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {interactions.comments.map((comment: any) => (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-6 h-6 bg-[#2E7D32] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {comment.author_id?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                                                </div>
                                                <p className="font-medium text-sm">
                                                    {comment.author_id?.username || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p className="text-gray-700">{comment.text}</p>
                                        </div>
                                ))}
                            </div>
                        )}
                    </div>
                </article>
            </div>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}