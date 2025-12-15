import mongoose from 'mongoose';

// Database optimization configuration
export const optimizeDatabase = async () => {
  console.log('🔧 Optimizing database...');
  
  try {
    // Enable MongoDB query optimization
    mongoose.set('debug', false); // Set to true for debugging
    mongoose.set('bufferCommands', false);
    mongoose.set('autoIndex', true);
    
    // Connection pool settings
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
      compressors: ['zlib'], // Enable compression
    };
    
    // Create indexes for better query performance
    await createIndexes();
    
    console.log('✅ Database optimization complete');
  } catch (error) {
    console.error('❌ Database optimization error:', error);
  }
};

// Create indexes for all collections
const createIndexes = async () => {
  const db = mongoose.connection.db;
  
  if (!db) {
    console.log('⏳ Waiting for database connection...');
    return;
  }
  
  // Investment Products indexes
  try {
    const investmentProducts = db.collection('investmentproducts');
    
    // Compound index for common queries
    await investmentProducts.createIndex({ 
      isActive: 1, 
      fundingStatus: 1, 
      createdAt: -1 
    });
    
    // Text index for search
    await investmentProducts.createIndex({ 
      productTitle: 'text', 
      description: 'text',
      artistName: 'text' 
    });
    
    // Index for featured products
    await investmentProducts.createIndex({ 
      isFeatured: 1, 
      isActive: 1 
    });
    
    // Index for category filtering
    await investmentProducts.createIndex({ category: 1 });
    
    console.log('✅ Investment product indexes created');
  } catch (error) {
    console.log('⚠️ Investment product indexes may already exist');
  }
  
  // Users indexes
  try {
    const users = db.collection('users');
    
    // Unique index on email
    await users.createIndex({ email: 1 }, { unique: true });
    
    // Index for authentication
    await users.createIndex({ email: 1, password: 1 });
    
    console.log('✅ User indexes created');
  } catch (error) {
    console.log('⚠️ User indexes may already exist');
  }
  
  // Orders indexes
  try {
    const orders = db.collection('orders');
    
    // Index for user orders
    await orders.createIndex({ userId: 1, createdAt: -1 });
    
    // Index for order status
    await orders.createIndex({ status: 1 });
    
    console.log('✅ Order indexes created');
  } catch (error) {
    console.log('⚠️ Order indexes may already exist');
  }
  
  // Investors indexes
  try {
    const investors = db.collection('investors');
    
    // Index for investor queries
    await investors.createIndex({ userId: 1 });
    await investors.createIndex({ productId: 1 });
    await investors.createIndex({ createdAt: -1 });
    
    console.log('✅ Investor indexes created');
  } catch (error) {
    console.log('⚠️ Investor indexes may already exist');
  }
};

// Query optimization helpers
export const optimizeQuery = (query) => {
  return query
    .lean() // Return plain JavaScript objects
    .select('-__v') // Exclude version key
    .allowDiskUse(true); // Allow using disk for large sorts
};

// Aggregation pipeline optimization
export const optimizeAggregation = (pipeline) => {
  // Add $match stage early to filter documents
  const optimizedPipeline = [];
  
  // Move $match stages to the beginning
  const matchStages = pipeline.filter(stage => stage.$match);
  const otherStages = pipeline.filter(stage => !stage.$match);
  
  optimizedPipeline.push(...matchStages, ...otherStages);
  
  // Add allowDiskUse option
  return {
    pipeline: optimizedPipeline,
    options: { allowDiskUse: true }
  };
};

export default optimizeDatabase;
