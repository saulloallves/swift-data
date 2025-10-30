#!/bin/bash

# =========================================
# Script de Deploy - Sistema de Cadastro
# =========================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Sistema de Cadastro..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_msg() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# Passo 1: Parar containers antigos
print_msg "Parando containers antigos..."
docker-compose down || true

# Passo 2: Limpar imagens antigas
print_msg "Limpando imagens antigas..."
docker image prune -f || true

# Passo 3: Build da nova imagem
print_msg "Buildando nova imagem..."
docker-compose build --no-cache

# Passo 4: Iniciar containers
print_msg "Iniciando containers..."
docker-compose up -d

# Passo 5: Aguardar healthcheck
print_msg "Aguardando healthcheck..."
sleep 10

# Verificar se container está rodando
if docker ps | grep -q "cadastro-girabot"; then
    print_msg "✅ Container está rodando!"
else
    print_error "❌ Container não está rodando!"
    docker-compose logs
    exit 1
fi

# Passo 6: Verificar logs
print_msg "Últimas linhas do log:"
docker-compose logs --tail=20

# Passo 7: Testar aplicação
print_msg "Testando aplicação..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_msg "✅ Aplicação respondendo no healthcheck!"
else
    print_warning "⚠️ Healthcheck não respondeu, mas container está rodando"
fi

echo ""
print_msg "================================================"
print_msg "✨ Deploy concluído com sucesso!"
print_msg "================================================"
print_msg "📦 Container: cadastro-girabot"
print_msg "🌐 URL Local: http://localhost:3000"
print_msg "🌐 URL Pública: https://cadastro.girabot.com.br"
print_msg "================================================"
echo ""
print_msg "Comandos úteis:"
echo "  - Ver logs:        docker-compose logs -f"
echo "  - Parar:          docker-compose down"
echo "  - Reiniciar:      docker-compose restart"
echo "  - Status:         docker-compose ps"
echo ""
