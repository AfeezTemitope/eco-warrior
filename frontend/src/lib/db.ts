import Dexie, { type Table } from 'dexie';
import type { Post, Interaction } from '../store/types';

class EcoWarriorDB extends Dexie {
    posts!: Table<Post, string>;
    interactions!: Table<Interaction, string>;

    constructor() {
        super('EcoWarriorDB');
        this.version(1).stores({
            posts: '_id',
            interactions: 'post_id'
        });
    }
}

export const db = new EcoWarriorDB();