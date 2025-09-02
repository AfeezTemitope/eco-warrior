import { useEffect } from 'react';
import BlogPostCard from './BlogPostCard';
import { usePostStore } from '../store/postStore';
import { useInView } from 'react-intersection-observer';

export default function BlogList() {
    const { posts, loading, error, loadPosts, loadMorePosts, hasMore, loadInteractions } = usePostStore();
    const { ref, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        // Load interactions for all posts on mount
        posts.forEach((post) => {
            loadInteractions(post._id);
        });
    }, [posts, loadInteractions]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMorePosts();
        }
    }, [inView, hasMore, loading, loadMorePosts]);

    if (loading && posts.length === 0) return <div className="text-center py-8" aria-live="polite">Loading posts...</div>;
    if (error) return <div className="text-center py-8 text-red-500" role="alert">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-4">
                {posts.map((post) => (
                    <BlogPostCard
                        key={post._id}
                        post={{
                            _id: post._id,
                            title: post.title,
                            description: post.description,
                            image_url: post.image_url,
                            created_at: post.created_at,
                            author: {
                                id: post.author_id,
                                username: post.profiles?.username || 'Anonymous',
                            },
                        }}
                    />
                ))}
            </div>
            {hasMore && (
                <div ref={ref} className="text-center py-8" aria-live="polite">
                    {loading ? 'Loading more posts...' : 'Scroll to load more'}
                </div>
            )}
        </div>
    );
}