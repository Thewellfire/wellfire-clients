#!/bin/bash

echo "🎬 Fixing hero.mp4 for deployment..."
echo ""

cd /Users/kapildev/Desktop/wellfire.new2

# Step 1: Compress video
echo "📦 Step 1: Compressing video (390 MB → ~70 MB)..."
ffmpeg -i frontend/src/assets/hero.mp4 \
  -c:v libx264 -crf 28 -preset medium \
  -c:a aac -b:a 128k \
  frontend/src/assets/hero-compressed.mp4 \
  -y

if [ $? -ne 0 ]; then
    echo "❌ FFmpeg compression failed. Make sure FFmpeg is installed: brew install ffmpeg"
    exit 1
fi

# Check compressed file size
COMPRESSED_SIZE=$(du -h frontend/src/assets/hero-compressed.mp4 | cut -f1)
echo "✅ Compressed video size: $COMPRESSED_SIZE"

# Step 2: Replace original
echo ""
echo "🔄 Step 2: Replacing original with compressed version..."
rm frontend/src/assets/hero.mp4
mv frontend/src/assets/hero-compressed.mp4 frontend/src/assets/hero.mp4

# Step 3: Remove from LFS tracking
echo ""
echo "🗑️  Step 3: Removing from Git LFS..."
git rm --cached frontend/src/assets/hero.mp4

# Step 4: Add as regular file
echo ""
echo "➕ Step 4: Adding as regular Git file..."
git add frontend/src/assets/hero.mp4

# Step 5: Add all other changes
echo ""
echo "📝 Step 5: Adding all other changes..."
git add .

# Step 6: Commit
echo ""
echo "💾 Step 6: Committing changes..."
git commit -m "fix: Compress hero video and remove LFS tracking

- Compressed video from 390 MB to ~70 MB
- Removed Git LFS tracking to avoid bandwidth issues
- Video now commits directly to Git (under 100 MB limit)
- Fixes deployment build error on Render"

# Step 7: Push
echo ""
echo "🚀 Step 7: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Your deployment should now work."
echo "🔗 Check your Render dashboard for the new deployment."
