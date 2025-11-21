import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function seedSuperAdmin() {
    try {
        // 1. Check if superadmin already exists
        const { data: existingAdmins, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'superadmin');

        if (fetchError) throw fetchError;

        if (existingAdmins && existingAdmins.length > 0) {
            console.log("✅ Superadmin already exists. Skipping seeding.");
            return;
        }

        // 2. Create auth user
        const email = process.env.SUPERADMIN_EMAIL;
        const password = process.env.SUPERADMIN_PASSWORD;
        const username = "eco Warrior 🍀";

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // 3. Insert into profiles with role = superadmin
        const { error: insertError } = await supabase
            .from("profiles")
            .insert({ id: data.user.id, username, role: "superadmin" });

        if (insertError) throw insertError;

        console.log("🎉 Superadmin created successfully!");
    } catch (err) {
        console.error("❌ Superadmin seeding failed:", err.message);
    }
}
