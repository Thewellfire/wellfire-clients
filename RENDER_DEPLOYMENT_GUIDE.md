# Render Deployment Guide for Wellfire Platform

## Production URLs
- **Backend API**: https://wellfire-backend-5eww.onrender.com
- **Frontend**: https://wellfire-frontend-oa5j.onrender.com
- **Admin Panel**: https://wellfire-new2.onrender.com

## Pre-Deployment Checklist

### 1. Environment Variables Configuration
All `.env` files have been updated with production URLs. The configuration is as follows:

#### Backend (.env)
- `FRONTEND_URL=https://wellfire-frontend-oa5j.onrender.com`
- `ADMIN_URL=https://wellfire-new2.onrender.com`
- All other sensitive variables (MongoDB, Cloudinary, JWT, etc.) remain unchanged

#### Frontend (.env)
- `VITE_BACKEND_URL=https://wellfire-backend-5eww.onrender.com`

#### Admin Panel (.env)
- `VITE_BACKEND_URL=https://wellfire-backend-5eww.onrender.com`

### 2. CORS Configuration
The backend `server.js` has been updated to allow requests from:
- Frontend: https://wellfire-frontend-oa5j.onrender.com
- Admin: https://wellfire-new2.onrender.com
- All localhost ports for development

## Deployment Steps on Render

### Backend Service (wellfire-backend-5eww)

1. **Environment Variables to Add in Render Dashboard:**
   ```
   PORT=4000
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=greatstack123
   JWT_SECRET=wellfire_secret_key_2024_secure_token_generation
   MONGODB_URI=mongodb+srv://infowellfire_db_user:rNwxIkbEVmQo6U4n@wellfire.6ybxjdk.mongodb.net/wellfire
   CLOUDINARY_NAME=dyguccrfj
   CLOUDINARY_API_KEY=191375351829356
   CLOUDINARY_SECRET_KEY=MZlI0jKh-A-Q4U0sCINbpUCmj8M
   STRIPE_SECRET_KEY=your_stripe_secret_here
   RAZORPAY_KEY_SECRET=your_razorpay_secret_here
   RAZORPAY_KEY_ID=your_razorpay_key_id_here
   GOOGLE_CLIENT_ID=157300060933-jvifsion0fq80tdi9ph8r9jkhnogcqm2.apps.googleusercontent.com
   EMAIL_USER=info.wellfire@gmail.com
   EMAIL_PASSWORD=scti vynl tcev uoim0zzz
   FRONTEND_URL=https://wellfire-frontend-oa5j.onrender.com
   ADMIN_URL=https://wellfire-new2.onrender.com
   ```

2. **Build Command:**
   ```bash
   npm install
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

### Frontend Service (wellfire-frontend-oa5j)

1. **Environment Variables to Add in Render Dashboard:**
   ```
   VITE_BACKEND_URL=https://wellfire-backend-5eww.onrender.com
   ```

2. **Build Command:**
   ```bash
   npm install && npm run build
   ```

3. **Publish Directory:**
   ```
   dist
   ```

### Admin Panel Service (wellfire-new2)

1. **Environment Variables to Add in Render Dashboard:**
   ```
   VITE_BACKEND_URL=https://wellfire-backend-5eww.onrender.com
   ```

2. **Build Command:**
   ```bash
   cd "admin " && npm install && npm run build
   ```

3. **Publish Directory:**
   ```
   admin /dist
   ```

## Important Notes

1. **JWT_SECRET**: The current JWT_SECRET is set. For production security, consider generating a new one using:
   ```bash
   openssl rand -base64 32
   ```

2. **Database**: The MongoDB connection string is already configured. Ensure the database is accessible from Render's servers.

3. **Cloudinary**: All Cloudinary credentials are configured. Verify that the Cloudinary account has sufficient storage and bandwidth.

4. **Email Service**: Gmail app password is configured. Ensure 2FA is enabled on the Gmail account.

5. **Payment Gateways**: Update Stripe and Razorpay keys with actual production credentials before going live.

## Post-Deployment Verification

1. **Test Backend API:**
   ```bash
   curl https://wellfire-backend-5eww.onrender.com
   ```

2. **Test Frontend:**
   - Visit https://wellfire-frontend-oa5j.onrender.com
   - Check console for any CORS or API connection errors

3. **Test Admin Panel:**
   - Visit https://wellfire-new2.onrender.com
   - Login with admin credentials
   - Verify all admin functions work correctly

4. **Test Cross-Origin Requests:**
   - Ensure frontend can communicate with backend
   - Ensure admin panel can communicate with backend
   - Check browser console for any CORS errors

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Verify the URLs in backend's `server.js` CORS configuration
2. Ensure environment variables are properly set in Render
3. Check that the backend service is running

### Connection Issues
If frontend/admin cannot connect to backend:
1. Verify `VITE_BACKEND_URL` is correctly set
2. Check backend service logs in Render dashboard
3. Ensure MongoDB connection is working

### Authentication Issues
If JWT errors occur:
1. Verify `JWT_SECRET` is the same across all deployments
2. Check that the secret is properly loaded from environment variables
3. Clear browser cookies and try again

## GitHub Repository Setup

Before pushing to GitHub:

1. **Ensure `.env` files are in `.gitignore`:**
   ```
   .env
   .env.local
   .env.production
   ```

2. **Commit only example files:**
   - `.env.example` files are safe to commit
   - They document required variables without exposing secrets

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure production environment URLs for Render deployment"
   git push origin main
   ```

## Security Reminders

1. **Never commit `.env` files** with actual credentials to GitHub
2. **Use Render's environment variables** for all sensitive data
3. **Regularly rotate** JWT secrets and API keys
4. **Monitor** your MongoDB, Cloudinary, and email usage
5. **Enable** rate limiting and security headers in production
