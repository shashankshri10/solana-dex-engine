#!/bin/bash

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

case "$1" in
  setup)
    echo -e "${GREEN}🐳 Building and Starting Containers...${NC}"
    # Build image and start DBs first
    docker-compose up -d --build postgres redis
    
    echo -e "${GREEN}⏳ Waiting for Database to be healthy...${NC}"
    sleep 5
    
    echo -e "${GREEN}🗄️ Running Migrations (inside container)...${NC}"
    # We run the migration using the same environment context as the app
    docker-compose run --rm \
      -e DATABASE_URL=postgres://admin:password@postgres:5432/dex_engine \
      api npm run db:migrate
      
    echo -e "${GREEN}✅ Setup Complete.${NC}"
    ;;
  
  start)
    echo -e "${GREEN}🚀 Starting Full Stack (App + DB + Redis)...${NC}"
    docker-compose up api
    ;;
    
  test)
    echo -e "${GREEN}🧪 Running Tests (Local Unit Tests)...${NC}"
    npm test
    ;;

  stop)
    echo -e "${GREEN}🛑 Shutting down...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ System Stopped.${NC}"
    ;;
    
  *)
    echo "Usage: ./make.sh {setup|start|stop|test}"
    exit 1
    ;;
esac