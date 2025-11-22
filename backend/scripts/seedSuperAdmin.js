import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function seedSuperAdmin() {
    try {
        // 1. Check if superadmin already exists
        const { data: existingAdmins, error: fetchError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('role', 'superadmin');

        if (fetchError) throw fetchError;

        if (existingAdmins && existingAdmins.length > 0) {
            // If superadmin exists, update username
            const superAdminId = existingAdmins[0].id;
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ username: "eco Warrior 🍀" })
                .eq('id', superAdminId);

            if (updateError) throw updateError;

            console.log("✅ Superadmin already exists. Username updated to eco Warrior 🍀.");
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

        console.log("🎉 Superadmin created successfully with username eco Warrior 🍀!");
    } catch (err) {
        console.error("❌ Superadmin seeding failed:", err.message);
    }
}
