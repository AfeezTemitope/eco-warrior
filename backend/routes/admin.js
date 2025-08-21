import express from 'express';
import  { createClient } from '@supabase/supabase-js';
import authMiddleware from '../middleware/auth.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const router = express.Router();

const superadminMiddleware = (req, res, next) => {
    if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin only' });
    next();
};

router.use(authMiddleware, superadminMiddleware);

router.get('/admins', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, role')
            .in('role', ['admin', 'superadmin']);
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admins', async (req, res) => {
    const { email, password, username } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await supabase
            .from('profiles')
            .insert({ id: data.user.id, username, role: 'admin' });
        res.status(201).json({ id: data.user.id, username, role: 'admin' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admins/:id', async (req, res) => {
    try {
        if (req.params.id === req.user.userId) return res.status(403).json({ error: 'Cannot delete self' });
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.params.id)
            .single();
        if (!data || data.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete superadmin' });
        await supabase.from('profiles').delete().eq('id', req.params.id);
        res.json({ message: 'Admin deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;