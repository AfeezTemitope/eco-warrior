export interface Comment {
    _id: string;
    post_id: string;
    author_id: string;
    text: string;
    created_at: string;
}

export interface Post {
    id: string;
    title: string;
    description: string;
    content: string;
    image_url?: string;
    author_id: string;
    created_at: string;
    profiles: {
        username: string;
    };
}


export interface Interaction {
    post_id: string;
    claps: number;
    userClapped: boolean;
    comments: Comment[];
}

export interface Profile {
    id: string;
    username: string;
    role: 'superadmin' | 'admin' | 'user';
}
