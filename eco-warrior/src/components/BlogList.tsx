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
        posts.forEach((post) => {
            loadInteractions(post._id);
        });
    }, [posts, loadInteractions]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMorePosts();
        }
    }, [inView, hasMore, loading, loadMorePosts]);

    // Only show loading on initial load with no cached data
    if (loading && posts.length === 0) {
        return (
            <div className="text-center py-8" aria-live="polite">
                <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#2E7D32] rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="text-center py-8 text-red-500" role="alert">
                {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No posts available yet.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
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
                                username: post.profiles.username,
                            },
                        }}
                    />
                ))}
            </div>
            {hasMore && (
                <div ref={ref} className="text-center py-8" aria-live="polite">
                    {loading ? (
                        <div className="inline-block w-6 h-6 border-4 border-gray-300 border-t-[#2E7D32] rounded-full animate-spin"></div>
                    ) : (
                        <p className="text-gray-500">Scroll to load more</p>
                    )}
                </div>
            )}
        </div>
    );
}