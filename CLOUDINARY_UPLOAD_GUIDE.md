# Upload Video to Cloudinary Using Environment Variables

## Step 1: Get Cloudinary Credentials

1. **Sign up/Login to Cloudinary**: https://cloudinary.com/users/register/free
2. **Go to Dashboard**: https://cloudinary.com/console
3. **Copy your credentials**:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Add Credentials to .env File

Open `.env` file in the root directory and replace the placeholders:

```bash
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=wellfire-studio
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 3: Run the Upload Script

```bash
cd /Users/kapildev/Desktop/wellfire.new2
node upload-to-cloudinary.js
```

The script will:
- ✅ Upload your `hero.mp4` (390 MB)
- ✅ Show upload progress
- ✅ Display the video URL
- ✅ Take 2-5 minutes

## Step 4: Update Hero.jsx

After upload completes, copy the "Secure URL" from the output.

The script will automatically show you what to do next!

## Step 5: Commit and Deploy

```bash
git add frontend/src/components/Hero.jsx
git commit -m "fix: Use Cloudinary CDN for hero video"
git push origin main
```

Your Render deployment will now work! 🚀

---

## Troubleshooting

### Error: Credentials not found
- Make sure you saved the `.env` file
- Check that there are no spaces around the `=` sign
- Verify credentials are correct from Cloudinary dashboard

### Error: File not found
- Make sure `hero.mp4` exists at: `frontend/src/assets/hero.mp4`

### Upload is slow
- Normal for 390 MB file
- Takes 2-5 minutes depending on internet speed
- Don't close the terminal

---

## What Happens After Upload

1. Video is hosted on Cloudinary CDN
2. Global fast delivery
3. No Git LFS needed
4. Render build succeeds
5. Your site works perfectly!

---

## Cost

**Free Tier:**
- 25 GB bandwidth/month
- 25 GB storage
- Perfect for your needs!
