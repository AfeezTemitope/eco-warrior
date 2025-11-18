import { create } from 'zustand';
import api from '../lib/api';
import { useAuthStore } from './authStore';
import { db } from '../lib/db';
import { supabase } from '../lib/supabaseClient';
import type { Post, Comment, Interaction, PostFromApi } from './types';
import { AxiosError } from 'axios';

interface PostStore {
    interactions: Record<string, Interaction>;
    posts: Post[];
    hasMore: boolean;
    page: number;
    loading: boolean;
    error: string | null;
    addClap: (postId: string) => Promise<void>;
    removeClap: (postId: string) => Promise<void>;
    addComment: (postId: string, comment: Omit<Comment, '_id' | 'created_at' | 'username'>) => Promise<void>;
    getInteractions: (postId: string) => Interaction;
    loadInteractions: (postId: string) => Promise<void>;
    loadPosts: () => Promise<void>;
    loadMorePosts: () => Promise<void>;
    refreshInteractions: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostStore>((set, get) => ({
    interactions: {},
    posts: [],
    hasMore: true,
    page: 1,
    loading: false,
    error: null,

    addClap: async (postId) => {
        if (!useAuthStore.getState().requireAuth() || !postId) {
            throw new Error('Authentication required to clap');
        }
        try {
            const { data } = await api.post<{ claps: number }>('/claps/add', { post_id: postId });
            const current = get().interactions[postId] || {
                post_id: postId,
                claps: 0,
                userClapped: false,
                comments: [],
            };
            const updated: Interaction = {
                ...current,
                claps: data.claps,
                userClapped: true,
            };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put(updated);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('Failed to add clap:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add clap';
            throw new Error(errorMessage);
        }
    },

    removeClap: async (postId) => {
        if (!useAuthStore.getState().requireAuth() || !postId) {
            throw new Error('Authentication required to remove clap');
        }
        try {
            const { data } = await api.post<{ claps: number }>('/claps/remove', { post_id: postId });
            const current = get().interactions[postId] || {
                post_id: postId,
                claps: 0,
                userClapped: true,
                comments: [],
            };
            const updated: Interaction = {
                ...current,
                claps: data.claps,
                userClapped: false,
            };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put(updated);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('Failed to remove clap:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to remove clap';
            throw new Error(errorMessage);
        }
    },

    addComment: async (postId, comment) => {
        if (!useAuthStore.getState().requireAuth() || !postId) {
            throw new Error('Authentication required to comment');
        }
        if (!comment.text.trim()) {
            throw new Error('Comment cannot be empty');
        }
        try {
            const { data } = await api.post<Comment>('/comments', { post_id: postId, text: comment.text.trim() });
            data.username = useAuthStore.getState().session?.user.user_metadata?.username || 'eco warrior 🤝';
            const current = get().interactions[postId] || {
                post_id: postId,
                claps: 0,
                userClapped: false,
                comments: [],
            };
            const updated: Interaction = {
                ...current,
                comments: [...current.comments, data],
            };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put(updated);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('Failed to add comment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to post comment';
            throw new Error(errorMessage);
        }
    },

    getInteractions: (postId): Interaction => {
        return (
            get().interactions[postId] || {
                post_id: postId,
                claps: 0,
                userClapped: false,
                comments: [],
            }
        );
    },

    loadInteractions: async (postId) => {
        if (!postId) {
            set({ error: 'Invalid post ID' });
            return;
        }

        // Load from cache first
        const cached = await db.interactions.get(postId);
        if (cached) {
            set({ interactions: { ...get().interactions, [postId]: cached } });
        }

        try {
            const session = useAuthStore.getState().session;

            const [clapsRes, commentsRes] = await Promise.all([
                api.get<{ claps: number }>(`/claps/post/${postId}`),
                api.get<Comment[]>(`/comments/post/${postId}`),
            ]);

            let userClapped = false;
            if (session) {
                const userClappedRes = await api.get<{ userClapped: boolean }>(
                    `/claps/user-clapped/${postId}`
                );
                userClapped = userClappedRes.data.userClapped;
            }

            const uniqueAuthorIds = [...new Set(commentsRes.data.map(c => c.author_id).filter(Boolean))];
            if (uniqueAuthorIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username')
                    .in('id', uniqueAuthorIds);

                if (profilesError) {
                    console.error('Failed to fetch profiles for comments:', profilesError);
                } else if (profilesData) {
                    const profileMap = new Map(profilesData.map(p => [p.id, p.username]));
                    commentsRes.data.forEach(c => {
                        c.username = profileMap.get(c.author_id) || 'eco warrior 🤝';
                    });
                }
            }

            const interaction: Interaction = {
                post_id: postId,
                claps: clapsRes.data.claps,
                userClapped,
                comments: commentsRes.data,
            };

            set({ interactions: { ...get().interactions, [postId]: interaction } });
            await db.interactions.put(interaction);
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('Failed to load interactions:', error);
            if (!cached && navigator.onLine) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load interactions';
                set({ error: errorMessage });
            }
        }
    },

    refreshInteractions: async (postId) => {
        await get().loadInteractions(postId);
    },

    loadPosts: async () => {
        // Show cached data immediately
        const cachedPosts = await db.posts.toArray();
        if (cachedPosts.length > 0) {
            set({ posts: cachedPosts, loading: false });
        } else {
            set({ loading: true });
        }

        set({ error: null });
        try {
            const { data } = await api.get('/posts');
            console.log('Raw API response:', data);

            // Handle both array and single object responses
            let postsFromApi: PostFromApi[];
            if (Array.isArray(data)) {
                postsFromApi = data;
            } else if (data && typeof data === 'object') {
                postsFromApi = [data];
            } else {
                console.error('Invalid API response format:', data);
                throw new Error('Invalid response format from server');
            }

            const normalizedPosts = postsFromApi
                .filter((p: PostFromApi) => {
                    if (!p._id || typeof p._id !== 'string') {
                        console.warn('Invalid post (missing or invalid _id):', p);
                        return false;
                    }
                    return true;
                })
                .map((p: PostFromApi): Post => ({
                    _id: p._id,
                    title: p.title,
                    description: p.description,
                    content: p.content,
                    image_url: p.image_url,
                    author_id: p.author_id,
                    created_at: p.created_at,
                    profiles: { username: p.profiles?.username || 'eco warrior 🤝' },
                }));

            if (normalizedPosts.length > 0) {
                set({ posts: normalizedPosts, page: 1, hasMore: normalizedPosts.length >= 10, loading: false });
                await db.posts.clear();
                await db.posts.bulkPut(normalizedPosts);
            } else if (cachedPosts.length === 0) {
                set({ error: 'No posts available', loading: false });
            } else {
                set({ loading: false });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('loadPosts error:', error);

            if (cachedPosts.length === 0) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load posts';
                set({ error: errorMessage, loading: false });
            } else {
                set({ loading: false });
            }
        }
    },

    loadMorePosts: async () => {
        if (!get().hasMore || get().loading) return;
        set({ loading: true, error: null });
        try {
            const { data } = await api.get(`/posts?page=${get().page + 1}`);

            let postsFromApi: PostFromApi[];
            if (Array.isArray(data)) {
                postsFromApi = data;
            } else if (data && typeof data === 'object') {
                postsFromApi = [data];
            } else {
                throw new Error('Invalid response format');
            }

            const normalizedPosts = postsFromApi
                .filter((p: PostFromApi) => {
                    if (!p._id || typeof p._id !== 'string') {
                        console.warn('Invalid post:', p);
                        return false;
                    }
                    return true;
                })
                .map((p: PostFromApi): Post => ({
                    _id: p._id,
                    title: p.title,
                    description: p.description,
                    content: p.content,
                    image_url: p.image_url,
                    author_id: p.author_id,
                    created_at: p.created_at,
                    profiles: { username: p.profiles?.username || 'eco warrior 🤝' },
                }));

            if (normalizedPosts.length > 0) {
                set({
                    posts: [...get().posts, ...normalizedPosts],
                    page: get().page + 1,
                    hasMore: normalizedPosts.length >= 10,
                    loading: false,
                });
                await db.posts.bulkPut(normalizedPosts);
            } else {
                set({ hasMore: false, loading: false });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            console.error('loadMorePosts error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load more posts';
            if (navigator.onLine) {
                set({ error: errorMessage, loading: false });
            } else {
                set({ loading: false });
            }
        }
    },
}));

useAuthStore.subscribe((state) => {
    if (state.initialized && state.session !== undefined) {
        Object.keys(usePostStore.getState().interactions).forEach((postId) => {
            usePostStore.getState().refreshInteractions(postId);
        });
    }
});