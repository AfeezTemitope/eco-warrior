import { create } from 'zustand';
import api from '../lib/api';
import { useAuthStore } from './authStore';
import { db } from '../lib/db';
import type {Post, Comment} from './types';

interface PostInteraction {
    claps: number;
    userClapped: boolean;
    comments: Comment[];
}

interface PostStore {
    interactions: Record<string, PostInteraction>;
    posts: Post[];
    hasMore: boolean;
    page: number;
    loading: boolean;
    error: string | null;
    addClap: (postId: string) => Promise<void>;
    removeClap: (postId: string) => Promise<void>;
    addComment: (postId: string, comment: Omit<Comment, '_id' | 'created_at'>) => Promise<void>;
    getInteractions: (postId: string) => PostInteraction;
    loadInteractions: (postId: string) => Promise<void>;
    loadPosts: () => Promise<void>;
    loadMorePosts: () => Promise<void>;
}

export const usePostStore = create<PostStore>((set, get) => ({
    interactions: {},
    posts: [],
    hasMore: true,
    page: 1,
    loading: false,
    error: null,

    addClap: async (postId) => {
        if (!useAuthStore.getState().requireAuth()) return;
        try {
            await api.post('/claps/add', { post_id: postId });
            const current = get().interactions[postId] || { claps: 0, userClapped: false, comments: [] };
            const updated = { ...current, claps: current.claps + 1, userClapped: true };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put({ post_id: postId, ...updated });
        } catch (err: unknown) {
            console.error('Failed to add clap:', err);
        }
    },

    removeClap: async (postId) => {
        if (!useAuthStore.getState().requireAuth()) return;
        try {
            await api.post('/claps/remove', { post_id: postId });
            const current = get().interactions[postId] || { claps: 0, userClapped: false, comments: [] };
            const updated = { ...current, claps: Math.max(0, current.claps - 1), userClapped: false };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put({ post_id: postId, ...updated });
        } catch (err: unknown) {
            console.error('Failed to remove clap:', err);
        }
    },

    addComment: async (postId, comment) => {
        if (!useAuthStore.getState().requireAuth()) return;
        try {
            const { data } = await api.post('/comments', { post_id: postId, text: comment.text });
            const current = get().interactions[postId] || { claps: 0, userClapped: false, comments: [] };
            const updated = { ...current, comments: [...current.comments, data] };
            set({ interactions: { ...get().interactions, [postId]: updated } });
            await db.interactions.put({ post_id: postId, ...updated });
        } catch (err: unknown) {
            console.error('Failed to add comment:', err);
        }
    },

    getInteractions: (postId) =>
        get().interactions[postId] || { claps: 0, userClapped: false, comments: [] },

    loadInteractions: async (postId) => {
        try {
            const cached = await db.interactions.get(postId);
            if (cached) {
                set({ interactions: { ...get().interactions, [postId]: cached } });
            }

            const [clapsRes, userClappedRes, commentsRes] = await Promise.all([
                api.get(`/claps/post/${postId}`),
                api.get(`/claps/user-clapped/${postId}`),
                api.get(`/comments/post/${postId}`)
            ]);

            const interactions: PostInteraction = {
                claps: clapsRes.data.claps,
                userClapped: userClappedRes.data.userClapped,
                comments: commentsRes.data
            };

            set({ interactions: { ...get().interactions, [postId]: interactions } });
            await db.interactions.put({ post_id: postId, ...interactions });
        } catch (err: unknown) {
            if (navigator.onLine && !(err as any).response) {
                set({ error: 'Failed to load interactions' });
            }
        }
    },

    loadPosts: async () => {
        set({ loading: true, error: null });
        try {
            const cachedPosts = await db.posts.toArray();
            if (cachedPosts.length > 0) {
                set({ posts: cachedPosts, loading: false });
            }

            const { data: posts } = await api.get('/posts');
            set({ posts, page: 1, hasMore: posts.length >= 10 });
            await db.posts.clear();
            await db.posts.bulkPut(posts);
        } catch (err: unknown) {
            set({ loading: false });
            if (navigator.onLine && !(err as any).response) {
                set({ error: 'Failed to load posts' });
            } else if (!navigator.onLine && (await db.posts.count()) === 0) {
                set({ error: 'No cached posts available offline' });
            }
        }
    },

    loadMorePosts: async () => {
        if (!get().hasMore || get().loading) return;
        set({ loading: true, error: null });
        try {
            const { data: posts } = await api.get(`/posts?page=${get().page + 1}`);
            set({
                posts: [...get().posts, ...posts],
                page: get().page + 1,
                hasMore: posts.length >= 10,
                loading: false
            });
            await db.posts.bulkPut(posts);
        } catch (err: unknown) {
            set({ loading: false });
            if (navigator.onLine && !(err as any).response) {
                set({ error: 'Failed to load more posts' });
            }
        }
    }
}));
