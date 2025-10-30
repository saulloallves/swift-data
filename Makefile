.PHONY: help build up down restart logs clean deploy test health

# Variáveis
COMPOSE_FILE = docker-compose.yml
SERVICE_NAME = cadastro-app
CONTAINER_NAME = cadastro-girabot

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)Comandos disponíveis:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build da imagem Docker
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up: ## Inicia os containers
	@echo "$(GREEN)Starting containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Containers started!$(NC)"
	@make health

down: ## Para e remove os containers
	@echo "$(YELLOW)Stopping containers...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down

restart: ## Reinicia os containers
	@echo "$(YELLOW)Restarting containers...$(NC)"
	@make down
	@make up

logs: ## Mostra os logs dos containers
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-tail: ## Mostra últimas 50 linhas dos logs
	docker-compose -f $(COMPOSE_FILE) logs --tail=50

status: ## Mostra status dos containers
	docker-compose -f $(COMPOSE_FILE) ps

health: ## Verifica health do container
	@echo "$(GREEN)Checking health...$(NC)"
	@sleep 5
	@if curl -f http://localhost:3000/health > /dev/null 2>&1; then \
		echo "$(GREEN)✅ Application is healthy!$(NC)"; \
	else \
		echo "$(RED)❌ Application is not responding$(NC)"; \
	fi

clean: ## Remove containers, imagens e volumes não usados
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

deploy: ## Build e deploy completo
	@echo "$(GREEN)Starting full deployment...$(NC)"
	@make down
	@make build
	@make up
	@echo "$(GREEN)✨ Deployment complete!$(NC)"
	@make status

shell: ## Acessa shell do container
	docker exec -it $(CONTAINER_NAME) sh

test: ## Testa a aplicação
	@echo "$(GREEN)Testing application...$(NC)"
	@if curl -f http://localhost:3000/ > /dev/null 2>&1; then \
		echo "$(GREEN)✅ Homepage is accessible$(NC)"; \
	else \
		echo "$(RED)❌ Homepage is not accessible$(NC)"; \
	fi
	@if curl -f http://localhost:3000/health > /dev/null 2>&1; then \
		echo "$(GREEN)✅ Health endpoint is accessible$(NC)"; \
	else \
		echo "$(RED)❌ Health endpoint is not accessible$(NC)"; \
	fi

stats: ## Mostra estatísticas de uso do container
	docker stats $(CONTAINER_NAME) --no-stream

inspect: ## Inspeciona o container
	docker inspect $(CONTAINER_NAME)

dev: ## Inicia em modo desenvolvimento (com logs)
	docker-compose -f $(COMPOSE_FILE) up

prod: ## Deploy para produção
	@make deploy
