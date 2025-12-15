
# wellfire.com

## 🚨 Important: Video Asset Configuration

The hero video (`hero.mp4`) has been removed from Git LFS to avoid deployment budget issues. The app will:
- **Local Development**: Use the local `hero.mp4` file if present in `frontend/src/assets/`
- **Production Build**: Automatically fallback to a gradient background if the video is missing

To use the video locally, place `hero.mp4` in `frontend/src/assets/` (file is gitignored).

## Backend Dependencies (Create backend if not exists):
```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer helmet morgan express-rate-limit joi cloudinary
npm install -D nodemon
```
Admin Panel Dependencies:
bashnpm install react react-dom react-router-dom axios prop-types react-toastify react-icons @vitejs/plugin-react vite tailwindcss postcss autoprefixer
Frontend Dependencies:
bashnpm install react react-dom react-router-dom axios react-toastify react-icons framer-motion lucide-react @vitejs/plugin-react vite tailwindcss postcss autoprefixer
🔧 Quick Start Commands:

Setup all dependencies:

bash# Admin panel
cd admin && npm install

# Frontend
cd frontend && npm install

# Backend 
cd backend && npm install

Create environment files:


.env in backend with MongoDB URI, JWT secret
.env in admin with VITE_BACKEND_URL=http://localhost:4000
.env in frontend with VITE_BACKEND_URL=http://localhost:4000


Run the application:

bash# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Admin  
cd admin && npm run dev

# Terminal 3 - Frontend
cd frontend && npm run dev
The README includes all necessary setup instructions, dependencies, API endpoints, and deployment guides. Your project structure suggests a sophisticated entertainment investment platform with admin management capabilities!
