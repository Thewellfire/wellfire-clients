const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🎬 Cloudinary Video Upload Script');
console.log('==================================\n');

// Check if credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Error: Cloudinary credentials not found in .env file\n');
  console.log('📋 Please add these to your .env file:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret\n');
  console.log('🔗 Get credentials from: https://cloudinary.com/console\n');
  process.exit(1);
}

console.log('✅ Cloudinary configured');
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

// Video file path
const videoPath = path.join(__dirname, 'frontend/src/assets/hero.mp4');

console.log('📤 Uploading video...');
console.log(`   File: ${videoPath}`);
console.log('   This may take 2-5 minutes for a 390 MB file...\n');

// Upload video with chunked upload for large files
cloudinary.uploader.upload_large(videoPath, {
  resource_type: 'video',
  public_id: 'hero',
  folder: 'wellfire',
  overwrite: true,
  chunk_size: 6000000, // 6MB chunks
  // Optional: Add transformations
  eager: [
    { quality: 'auto', fetch_format: 'auto' }
  ],
  eager_async: true
}, (error, result) => {
  if (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Upload successful!\n');
  console.log('==================================');
  console.log('📊 Video Details:');
  console.log('==================================');
  console.log(`   Public ID: ${result.public_id}`);
  console.log(`   Format: ${result.format}`);
  console.log(`   Duration: ${result.duration} seconds`);
  console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Width: ${result.width}px`);
  console.log(`   Height: ${result.height}px\n`);
  
  console.log('==================================');
  console.log('🔗 Video URLs:');
  console.log('==================================');
  console.log(`   Secure URL: ${result.secure_url}\n`);
  
  console.log('==================================');
  console.log('📝 Next Steps:');
  console.log('==================================');
  console.log('1. Copy the Secure URL above');
  console.log('2. Update Hero.jsx with this URL:');
  console.log(`   const heroVideo = "${result.secure_url}";\n`);
  console.log('3. Commit and push to GitHub');
  console.log('4. Your Render deployment will work! 🚀\n');
});
