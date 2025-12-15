# Solution: Compress and Commit Video Directly to Git

Your `hero.mp4` is 390 MB, which is too large for:
- Git LFS (bandwidth exceeded)
- Direct Git commit (GitHub limit: 100 MB)

## Solution: Compress Video to Under 100 MB

### Step 1: Install FFmpeg
```bash
brew install ffmpeg
```

### Step 2: Compress Your Video
```bash
cd /Users/kapildev/Desktop/wellfire.new2

# Compress video: 390 MB → ~50-80 MB (good quality)
ffmpeg -i frontend/src/assets/hero.mp4 \
  -c:v libx264 -crf 28 -preset medium \
  -vf "scale=1920:1080" \
  -c:a aac -b:a 128k \
  frontend/src/assets/hero-compressed.mp4

# Check new size
ls -lh frontend/src/assets/hero-compressed.mp4
```

### Step 3: Replace Original with Compressed
```bash
# Backup original (optional)
mv frontend/src/assets/hero.mp4 frontend/src/assets/hero-original.mp4

# Use compressed version
mv frontend/src/assets/hero-compressed.mp4 frontend/src/assets/hero.mp4
```

### Step 4: Remove from LFS and Commit Directly
```bash
# Remove LFS tracking
git rm --cached frontend/src/assets/hero.mp4
git add frontend/src/assets/hero.mp4

# Commit
git commit -m "fix: Use compressed hero video (no LFS)"

# Push
git push origin main
```

### Step 5: Update Hero.jsx (Already Done)
```javascript
import heroVideo from "../assets/hero.mp4"; // This will now work!
```

---

## Alternative: Even Smaller File (Recommended)

For faster loading and smaller size (~30 MB):

```bash
# More aggressive compression
ffmpeg -i frontend/src/assets/hero.mp4 \
  -c:v libx264 -crf 32 -preset fast \
  -vf "scale=1280:720" \
  -c:a aac -b:a 96k \
  frontend/src/assets/hero-small.mp4
```

---

## Why This Works

**Before:**
- 390 MB video in Git LFS
- LFS bandwidth exceeded
- Render can't download during build
- ❌ Build fails

**After:**
- 50-80 MB video directly in Git
- No LFS needed
- File downloads during git clone
- ✅ Build succeeds

---

## Quality Comparison

| Version | Size | Quality | Use Case |
|---------|------|---------|----------|
| Original | 390 MB | Excellent | Too large for Git |
| CRF 28 | ~70 MB | Very Good | **Recommended** |
| CRF 32 | ~40 MB | Good | Faster loading |
| 720p | ~30 MB | Good | Mobile-first |

**CRF Scale:** Lower = better quality, larger file (18-28 is good range)

---

## Run These Commands Now

```bash
# 1. Install FFmpeg
brew install ffmpeg

# 2. Compress video
cd /Users/kapildev/Desktop/wellfire.new2
ffmpeg -i frontend/src/assets/hero.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k frontend/src/assets/hero-new.mp4

# 3. Check size (should be under 100 MB)
ls -lh frontend/src/assets/hero-new.mp4

# 4. Replace original
rm frontend/src/assets/hero.mp4
mv frontend/src/assets/hero-new.mp4 frontend/src/assets/hero.mp4

# 5. Remove from LFS and commit
git rm --cached frontend/src/assets/hero.mp4
git add frontend/src/assets/hero.mp4
git commit -m "fix: Compress hero video to work without LFS"
git push origin main
```

Your deployment will now work! 🎉
