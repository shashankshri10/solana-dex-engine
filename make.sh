#!/bin/bash

# Commands
case "$1" in
  setup)
    echo "📦 Installing Dependencies..."
    npm install
    echo "🐳 Starting Docker Containers..."
    docker-compose up -d
    echo "⏳ Waiting for Database..."
    sleep 5
    echo "🗄️ Running Migrations..."
    npm run db:generate
    npm run db:migrate
    echo "✅ Setup Complete. Run './make.sh start' to launch."
    ;;
  
  start)
    echo "🚀 Starting Server..."
    npm run dev
    ;;
  
  clean)
    echo "🧹 Cleaning up..."
    docker-compose down
    rm -rf node_modules dist
    ;;
    
  *)
    echo "Usage: ./make.sh {setup|start|clean}"
    exit 1
    ;;
esac