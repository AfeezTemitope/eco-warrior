import  { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const authMiddleware =  async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({error: 'No token provided'});

    try {
        const {data: {user}, error} = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({error: 'Invalid token'});

        const {data} = await supabase
            .from('profiles')
            .select('id, username, role')
            .eq('id', user.id)
            .single();

        if (!data) return res.status(403).json({error: 'Profile not found'});

        req.user = {userId: data.id, username: data.username, role: data.role};
        next();
    } catch (err) {
        res.status(401).json({error: 'Authentication failed'});
    }
};

export default authMiddleware;