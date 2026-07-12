const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

(async () => {
    try {
        await connectDB();
        const email = process.argv[2] || 'testcust@example.com';
        const role = process.argv[3] || 'sales';

        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (!user) {
            console.log('User not found:', email);
            process.exit(1);
        }

        user.role = role;
        await user.save();
        console.log(`User ${email} promoted to role: ${role}`);
        process.exit(0);
    } catch (err) {
        console.error('Error promoting user:', err.message);
        process.exit(1);
    }
})();
