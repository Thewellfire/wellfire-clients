// Quick script to check products in database
import mongoose from 'mongoose';
import 'dotenv/config';
import InvestmentProduct from './models/investmentProductModel.js';

const checkProducts = async () => {
    try {
        // Connect to MongoDB with the same database as the server
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log('✅ Connected to MongoDB (e-commerce database)');

        // Count products
        const count = await InvestmentProduct.countDocuments();
        console.log(`\n📊 Total products in database: ${count}`);

        // Get all products
        const products = await InvestmentProduct.find().limit(10);
        
        if (products.length > 0) {
            console.log('\n📦 Products found:');
            products.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.productTitle}`);
                console.log(`   - Category: ${product.category}`);
                console.log(`   - Budget: ₹${product.totalBudget}`);
                console.log(`   - Status: ${product.productStatus}`);
                console.log(`   - Active: ${product.isActive}`);
                console.log(`   - ID: ${product._id}`);
            });
        } else {
            console.log('\n⚠️  No products found in database!');
            console.log('\nTo fix this, you need to:');
            console.log('1. Go to your admin panel (http://localhost:5174)');
            console.log('2. Login with admin credentials');
            console.log('3. Add investment products through the admin interface');
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkProducts();
