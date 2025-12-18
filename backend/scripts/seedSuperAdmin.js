import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

export default async function seedSuperAdmin() {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const email = process.env.SUPERADMIN_EMAIL;
        const password = process.env.SUPERADMIN_PASSWORD;
        const username = "eco Warrior 🤝";

        const FIXED_UUID = '69392f010da3d1d4e8899b8f';

        if (!email || !password) {
            throw new Error('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env');
        }

        // Try to find existing user by email
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('✅ Superadmin already exists');
            console.log('   ID:', existingAdmin._id);
            console.log('   Email:', existingAdmin.email);
            console.log('   Role:', existingAdmin.role);

            // Update password using findOneAndUpdate instead of .save()
            const hashedPassword = await bcrypt.hash(password, 10);

            await User.findOneAndUpdate(
                { email },
                {
                    $set: {
                        password: hashedPassword,
                        username: username,
                        role: 'superadmin'
                    }
                },
                { new: true }
            );

            console.log('✅ Superadmin credentials updated');
            return;
        }

        // Only create if user doesn't exist at all
        console.log('📝 Creating new superadmin...');
        const hashedPassword = await bcrypt.hash(password, 10);

        const superAdmin = new User({
            _id: FIXED_UUID,
            email,
            password: hashedPassword,
            username,
            role: 'superadmin'
        });

        await superAdmin.save();

        console.log('🎉 Superadmin created successfully!');
        console.log('   Email:', email);
        console.log('   Username:', username);
        console.log('   UUID:', FIXED_UUID);
    } catch (err) {
        // If user already exists, that's fine - just log and continue
        if (err.code === 11000) {
            console.log('ℹ️  Superadmin already exists in database (duplicate key)');
            return;
        }

        console.error('❌ Superadmin seeding failed:', err.message);

        // Don't crash the server in production
        if (process.env.NODE_ENV === 'production') {
            console.error('   Server will continue');
        }
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSuperAdmin()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}