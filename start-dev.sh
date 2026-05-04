#!/bin/bash

echo "================================================"
echo "  Globe Wanderer - Full Stack Dev Server"
echo "================================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}[1/4] Checking backend setup...${NC}"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Backend dependencies not found. Installing..."
    npm install
fi

if [ ! -f "prisma/dev.db" ]; then
    echo "Database not found. Initializing..."
    npm run prisma:generate
    npm run prisma:push
    npm run prisma:seed
fi

echo ""
echo -e "${BLUE}[2/4] Starting Backend Server...${NC}"
echo "Backend will run at: http://localhost:3000"
echo "API Docs at: http://localhost:3000/api/docs"
echo ""

# Start backend in background
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

cd ..

echo -e "${BLUE}[3/4] Checking frontend setup...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Frontend dependencies not found. Installing..."
    npm install
fi

echo ""
echo -e "${BLUE}[4/4] Starting Frontend Server...${NC}"
echo "Frontend will run at: http://localhost:5173"
echo ""

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo "================================================"
echo -e "${GREEN}  Servers are running!${NC}"
echo "================================================"
echo ""
echo -e "Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "API Docs: ${BLUE}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${YELLOW}Login credentials:${NC}"
echo "Email: admin@globewanderer.com"
echo "Password: Admin@123456"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "================================================"
echo ""

# Function to handle Ctrl+C
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

trap cleanup INT

# Open browser (optional)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &>/dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &>/dev/null &
fi

# Wait for processes
wait
