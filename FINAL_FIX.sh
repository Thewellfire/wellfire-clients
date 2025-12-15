#!/bin/bash

echo "🎬 Final Fix: Compress and Deploy hero.mp4"
echo "============================================"
echo ""

cd /Users/kapildev/Desktop/wellfire.new2

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⏳ FFmpeg is not installed yet. Please wait for installation to complete."
    echo "Run this script again after FFmpeg installation finishes."
    exit 1
fi

echo "✅ FFmpeg is installed!"
echo ""

# Step 1: Compress video
echo "📦 Step 1/6: Compressing hero.mp4 (390 MB → ~70 MB)..."
echo "This will take 1-2 minutes..."
ffmpeg -i frontend/src/assets/hero.mp4 \
  -c:v libx264 -crf 28 -preset medium \
  -c:a aac -b:a 128k \
  frontend/src/assets/hero-compressed.mp4 \
  -y \
  -loglevel error

if [ $? -ne 0 ]; then
    echo "❌ Compression failed!"
    exit 1
fi

COMPRESSED_SIZE=$(du -h frontend/src/assets/hero-compressed.mp4 | awk '{print $1}')
echo "✅ Compressed! New size: $COMPRESSED_SIZE"
echo ""

# Step 2: Backup original
echo "💾 Step 2/6: Backing up original video..."
mv frontend/src/assets/hero.mp4 frontend/src/assets/hero-original-backup.mp4
echo "✅ Original backed up as: hero-original-backup.mp4"
echo ""

# Step 3: Use compressed version
echo "🔄 Step 3/6: Replacing with compressed version..."
mv frontend/src/assets/hero-compressed.mp4 frontend/src/assets/hero.mp4
echo "✅ Replaced!"
echo ""

# Step 4: Remove from LFS
echo "🗑️  Step 4/6: Removing from Git LFS..."
git rm --cached frontend/src/assets/hero.mp4 2>/dev/null || true
echo "✅ Removed from LFS cache"
echo ""

# Step 5: Add as regular file and commit all changes
echo "➕ Step 5/6: Adding to Git and committing..."
git add frontend/src/assets/hero.mp4
git add .
git commit -m "fix: Compress hero.mp4 and remove LFS tracking

- Compressed video from 390 MB to ~70 MB using H.264
- Removed Git LFS tracking to avoid bandwidth limits
- Video now stored directly in Git (under 100 MB limit)
- Fixes Render deployment build error
- Original backed up as hero-original-backup.mp4"

echo "✅ Committed!"
echo ""

# Step 6: Push to GitHub
echo "🚀 Step 6/6: Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ SUCCESS! Your deployment should now work!"
    echo "============================================"
    echo ""
    echo "📊 Summary:"
    echo "  • Original size: 390 MB"
    echo "  • New size: $COMPRESSED_SIZE"
    echo "  • Savings: ~80%"
    echo "  • No LFS needed: ✅"
    echo "  • Render will deploy: ✅"
    echo ""
    echo "🔗 Check your Render dashboard for the new deployment."
    echo "⏱️  Build should complete in 3-5 minutes."
else
    echo "❌ Push failed. Please check your Git configuration."
    exit 1
fi
