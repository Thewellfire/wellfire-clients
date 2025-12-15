const mongoose = require('mongoose');
const InvestmentProduct = require('./backend/models/investmentProductModel.js');

async function updateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/wellfire');
    console.log('Connected to MongoDB');
    
    // Get the first 3 products
    const products = await InvestmentProduct.find({}).limit(3);
    console.log('Found products:', products.length);
    
    if (products.length === 0) {
      console.log('No products found');
      return;
    }
    
    // Update first product to Media Production
    if (products[0]) {
      await InvestmentProduct.findByIdAndUpdate(products[0]._id, { 
        category: 'Media Production',
        productTitle: 'Media Production Sample Project'
      });
      console.log('Updated product 1 to Media Production');
    }
    
    // Update second product to Line Production Services
    if (products[1]) {
      await InvestmentProduct.findByIdAndUpdate(products[1]._id, { 
        category: 'Line Production Services',
        productTitle: 'Line Production Services Sample Project'
      });
      console.log('Updated product 2 to Line Production Services');
    }
    
    // Update third product to Government Subsidy Guidance
    if (products[2]) {
      await InvestmentProduct.findByIdAndUpdate(products[2]._id, { 
        category: 'Government Subsidy Guidance',
        productTitle: 'Government Subsidy Guidance Sample Project'
      });
      console.log('Updated product 3 to Government Subsidy Guidance');
    }
    
    console.log('All products updated successfully');
    
    // Verify the updates
    const updatedProducts = await InvestmentProduct.find({}).limit(3);
    console.log('Updated products:');
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productTitle} - ${product.category}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateProducts();
