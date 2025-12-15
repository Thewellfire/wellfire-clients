import 'dotenv/config';
import jwt from 'jsonwebtoken';

console.log('Testing JWT Configuration...\n');

// Check if JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables!');
    console.error('Please check your .env file');
    process.exit(1);
}

console.log('✅ JWT_SECRET is loaded from .env file');
console.log(`   Length: ${process.env.JWT_SECRET.length} characters`);

// Test creating a token
try {
    const testPayload = { id: 'test123', email: 'test@example.com' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('\n✅ Successfully created test token');
    console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...`);

    // Test verifying the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('\n✅ Successfully verified test token');
    console.log('   Decoded payload:', decoded);

} catch (error) {
    console.error('\n❌ Error with JWT operations:', error.message);
    process.exit(1);
}

console.log('\n✅ All JWT tests passed! Your JWT configuration is working correctly.');