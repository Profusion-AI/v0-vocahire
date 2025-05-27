# VocaHire MVP Makefile - Quick commands for development

# Default target
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: dev
dev: ## Start development environment with hot reload (http://localhost:3001)
	docker-compose -f docker-compose.dev.yml up

.PHONY: dev-build
dev-build: ## Rebuild and start development environment
	docker-compose -f docker-compose.dev.yml up --build

.PHONY: down
down: ## Stop all containers
	docker-compose -f docker-compose.dev.yml down

.PHONY: clean
clean: ## Stop containers and remove volumes (fresh start)
	docker-compose -f docker-compose.dev.yml down -v

.PHONY: logs
logs: ## Show logs from all containers
	docker-compose -f docker-compose.dev.yml logs -f

.PHONY: shell
shell: ## Open a shell in the web container
	docker-compose -f docker-compose.dev.yml exec web sh

.PHONY: db-shell
db-shell: ## Open PostgreSQL shell
	docker-compose -f docker-compose.dev.yml exec db psql -U postgres vocahire_dev

.PHONY: migrate
migrate: ## Run database migrations
	docker-compose -f docker-compose.dev.yml exec web pnpm prisma migrate dev

.PHONY: studio
studio: ## Open Prisma Studio
	docker-compose -f docker-compose.dev.yml exec web pnpm prisma studio

.PHONY: test
test: ## Run tests in container
	docker-compose -f docker-compose.dev.yml exec web pnpm test

.PHONY: lint
lint: ## Run linter
	docker-compose -f docker-compose.dev.yml exec web pnpm lint