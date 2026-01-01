#!/bin/bash
# Salon Booking Platform - Full Setup Script

echo "🚀 Salon Booking Platform Setup"
echo "================================"

# Check prerequisites
echo "✓ Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✓ Prerequisites OK"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✓ Backend dependencies installed"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - please update with your database credentials"
fi

echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✓ Frontend dependencies installed"

if [ ! -f .env.local ]; then
    touch .env.local
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> .env.local
    echo "✓ Created .env.local"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run: cd backend && npx prisma migrate dev"
echo "3. Run: cd backend && npm run start:dev"
echo "4. In another terminal: cd frontend && npm run dev"
echo ""
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:3000"
