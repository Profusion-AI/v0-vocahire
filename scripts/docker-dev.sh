#!/bin/bash

# VocaHire Docker Development Script
# Simplifies local Docker development workflow

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Show help
show_help() {
    echo "VocaHire Docker Development Helper"
    echo ""
    echo "Usage: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up          Start all services (builds if needed)"
    echo "  down        Stop all services"
    echo "  build       Build/rebuild all services"
    echo "  logs        Show logs from all services"
    echo "  logs [svc]  Show logs from specific service"
    echo "  shell [svc] Open shell in service container"
    echo "  prisma      Run Prisma commands in container"
    echo "  clean       Stop services and remove volumes"
    echo "  test        Run tests in container"
    echo "  help        Show this help message"
}

# Check if docker-compose is installed
check_dependencies() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
}

# Load environment variables
load_env() {
    if [ -f .env.local ]; then
        print_status "Loading environment from .env.local"
        export $(cat .env.local | grep -v '^#' | xargs)
    elif [ -f .env ]; then
        print_status "Loading environment from .env"
        export $(cat .env | grep -v '^#' | xargs)
    else
        print_warning "No .env file found. Using system environment variables."
    fi
}

# Main command handler
case "$1" in
    up)
        check_dependencies
        load_env
        print_status "Starting VocaHire services..."
        docker-compose up -d
        print_status "Services started! Access the app at http://localhost:3000"
        ;;
    
    down)
        check_dependencies
        print_status "Stopping VocaHire services..."
        docker-compose down
        ;;
    
    build)
        check_dependencies
        load_env
        print_status "Building VocaHire services..."
        docker-compose build --no-cache
        ;;
    
    logs)
        check_dependencies
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    
    shell)
        check_dependencies
        SERVICE=${2:-vocahire-app}
        print_status "Opening shell in $SERVICE..."
        docker-compose exec "$SERVICE" sh
        ;;
    
    prisma)
        check_dependencies
        shift
        print_status "Running Prisma command: $@"
        docker-compose exec vocahire-app pnpm prisma "$@"
        ;;
    
    clean)
        check_dependencies
        print_warning "This will stop all services and remove volumes!"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            print_status "Clean complete!"
        fi
        ;;
    
    test)
        check_dependencies
        load_env
        print_status "Running tests in container..."
        docker-compose exec vocahire-app pnpm test
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac