# Upload Your Hero Video to Cloudinary

## Quick Steps (5 minutes)

### 1. Sign Up for Cloudinary (Free)
- Go to: https://cloudinary.com/users/register/free
- Sign up with email
- Free tier: 25 GB bandwidth/month (plenty for your needs)

### 2. Upload Your Video
**Option A: Web Interface (Easiest)**
1. Login to Cloudinary dashboard
2. Click "Media Library" in left sidebar
3. Click "Upload" button (top right)
4. Select: `/Users/kapildev/Desktop/wellfire.new2/frontend/src/assets/hero.mp4`
5. Wait for upload (390 MB will take 2-5 minutes)
6. Click on uploaded video
7. Copy the "Secure URL" - looks like:
   ```
   https://res.cloudinary.com/YOUR-CLOUD-NAME/video/upload/v1234567890/hero.mp4
   ```

**Option B: Command Line (Faster)**
```bash
# Install Cloudinary CLI
npm install -g cloudinary-cli

# Login (you'll get API credentials from dashboard)
cloudinary config

# Upload video
cloudinary uploader upload frontend/src/assets/hero.mp4 --resource_type video --public_id hero

# Copy the returned URL
```

### 3. Update Hero.jsx
Once you have the URL, update line 5 in `Hero.jsx`:

```javascript
const heroVideo = "YOUR_CLOUDINARY_URL_HERE";
```

### 4. Commit and Push
```bash
git add frontend/src/components/Hero.jsx
git commit -m "fix: Use Cloudinary CDN for hero video"
git push origin main
```

### 5. Deploy
Your Render deployment will now succeed!

---

## Why This Works

**Problem:**
- Git LFS has bandwidth limits (1 GB/month free)
- Your video (390 MB) exceeded the quota
- Render can't download the video during build
- Build fails: "Could not resolve hero.mp4"

**Solution:**
- Video hosted on Cloudinary CDN
- No Git LFS needed
- Fast global delivery
- Free tier is sufficient
- Build succeeds immediately

---

## Alternative: Compress Video First

To save bandwidth and improve loading speed:

```bash
# Install FFmpeg
brew install ffmpeg

# Compress video (390 MB → ~60 MB)
ffmpeg -i frontend/src/assets/hero.mp4 \
  -c:v libx264 -crf 28 -preset medium \
  -c:a aac -b:a 128k \
  hero-compressed.mp4

# Then upload hero-compressed.mp4 to Cloudinary
```

This maintains good quality while reducing file size by 85%!

---

## Need Help?

If you prefer, I can:
1. Set up the Cloudinary upload for you
2. Compress the video first
3. Use a different CDN (AWS S3, Vercel Blob, etc.)

Just let me know your Cloudinary URL once uploaded, and I'll update Hero.jsx for you!
