// Script to migrate products from default database to e-commerce database
import mongoose from 'mongoose';
import 'dotenv/config';

const migrateProducts = async () => {
    try {
        // Connect to the default database (where products currently are)
        const sourceConnection = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
        console.log('✅ Connected to source database (default)');

        // Connect to the e-commerce database (where products should be)
        const targetConnection = await mongoose.createConnection(`${process.env.MONGODB_URI}/e-commerce`).asPromise();
        console.log('✅ Connected to target database (e-commerce)');

        // Define the schema for both connections
        const productSchema = new mongoose.Schema({}, { strict: false, collection: 'investmentproducts' });
        
        const SourceProduct = sourceConnection.model('InvestmentProduct', productSchema);
        const TargetProduct = targetConnection.model('InvestmentProduct', productSchema);

        // Get all products from source
        const sourceProducts = await SourceProduct.find({});
        console.log(`\n📦 Found ${sourceProducts.length} products in source database`);

        if (sourceProducts.length === 0) {
            console.log('⚠️  No products to migrate!');
            await sourceConnection.close();
            await targetConnection.close();
            process.exit(0);
        }

        // Check if target already has products
        const targetCount = await TargetProduct.countDocuments();
        console.log(`📊 Target database currently has ${targetCount} products`);

        // Copy products to target database
        console.log('\n🔄 Migrating products...\n');
        
        for (const product of sourceProducts) {
            const productData = product.toObject();
            delete productData._id; // Remove _id to let MongoDB generate a new one
            
            // Check if product already exists in target
            const exists = await TargetProduct.findOne({ productTitle: productData.productTitle });
            
            if (exists) {
                console.log(`⏭️  Skipped "${productData.productTitle}" (already exists)`);
            } else {
                await TargetProduct.create(productData);
                console.log(`✅ Migrated "${productData.productTitle}"`);
            }
        }

        // Verify migration
        const finalCount = await TargetProduct.countDocuments();
        console.log(`\n✅ Migration complete!`);
        console.log(`📊 Target database now has ${finalCount} products`);

        await sourceConnection.close();
        await targetConnection.close();
        
        console.log('\n🎉 All done! Restart your backend server and refresh the frontend.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

migrateProducts();
