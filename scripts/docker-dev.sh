#!/bin/bash

# VocaHire MVP Docker Script - Simplified for speed
set -e

# Just use the new docker-compose.dev.yml
case "$1" in
    up)
        echo "🚀 Starting MVP environment..."
        docker-compose -f docker-compose.dev.yml up
        ;;
    build)
        echo "🔨 Rebuilding and starting..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    down)
        echo "🛑 Stopping services..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    *)
        echo "Usage: $0 {up|build|down}"
        echo ""
        echo "Tip: Use 'make' for more commands:"
        echo "  make dev        - Start with hot reload"
        echo "  make dev-build  - Rebuild and start"
        echo "  make shell      - Open container shell"
        echo "  make help       - See all commands"
        ;;
esac