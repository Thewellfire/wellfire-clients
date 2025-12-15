// Script to fix products with zero budget
import mongoose from 'mongoose';
import 'dotenv/config';
import InvestmentProduct from './models/investmentProductModel.js';

const fixBudgets = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find products with zero budget
        const productsWithZeroBudget = await InvestmentProduct.find({ 
            totalBudget: 0 
        });

        console.log(`\n📊 Found ${productsWithZeroBudget.length} products with zero budget`);

        if (productsWithZeroBudget.length === 0) {
            console.log('✅ All products have valid budgets!');
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log('\n🔧 Updating products with default budgets...\n');

        // Update each product with a default budget based on category
        for (const product of productsWithZeroBudget) {
            let defaultBudget;
            
            // Set default budget based on category
            if (product.category === 'Film') {
                defaultBudget = 5000000; // 50 lakhs for films
            } else if (product.category === 'Music') {
                defaultBudget = 500000; // 5 lakhs for music
            } else {
                defaultBudget = 1000000; // 10 lakhs for others
            }

            // Set default minimum investment (10% of total budget)
            const defaultMinInvestment = Math.floor(defaultBudget * 0.1);

            product.totalBudget = defaultBudget;
            if (product.minimumInvestment === 0) {
                product.minimumInvestment = defaultMinInvestment;
            }
            
            await product.save();
            
            console.log(`✅ Updated "${product.productTitle}"`);
            console.log(`   - Budget: ₹${defaultBudget.toLocaleString('en-IN')}`);
            console.log(`   - Min Investment: ₹${product.minimumInvestment.toLocaleString('en-IN')}\n`);
        }

        console.log('✅ All products updated successfully!');
        console.log('\n🎉 Now refresh your frontend to see the products!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixBudgets();
