#!/bin/bash

# Auto-fix script for backend port conflicts
# This script automatically kills processes using port 4000 and starts the server

echo "🔧 Checking for port conflicts..."

# Kill any processes using port 4000
PORT_4000_PIDS=$(lsof -ti:4000 2>/dev/null)
if [ ! -z "$PORT_4000_PIDS" ]; then
    echo "⚠️  Found processes using port 4000: $PORT_4000_PIDS"
    echo "🛠️  Killing conflicting processes..."
    kill -9 $PORT_4000_PIDS 2>/dev/null
    sleep 1
    echo "✅ Conflicting processes terminated"
else
    echo "✅ Port 4000 is available"
fi

# Kill any existing nodemon processes for this project
echo "🧹 Cleaning up old nodemon processes..."
pkill -f "nodemon.*server.js" 2>/dev/null || echo "No nodemon processes found"

# Kill any existing node processes running server.js
echo "🧹 Cleaning up old node server processes..."
pkill -f "node.*server.js" 2>/dev/null || echo "No node server processes found"

echo "🚀 Starting backend server..."
npm run server
