# 🚀 Quick Start - Docker Deploy

## Deploy Local (Desenvolvimento)

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Deploy no VPS (Produção)

### 1. Preparar Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install -y nginx
```

### 2. Deploy da Aplicação

```bash
# Clonar repositório
cd /opt/apps
git clone <repo-url> cadastro-app
cd cadastro-app

# Deploy
./deploy.sh

# Ou manualmente
docker-compose up -d
```

### 3. Configurar Nginx

```bash
# Copiar configuração
sudo cp nginx-vps.conf /etc/nginx/sites-available/cadastro.girabot.com.br

# Ativar
sudo ln -s /etc/nginx/sites-available/cadastro.girabot.com.br /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL com Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d cadastro.girabot.com.br
```

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Atualizar
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Status
docker-compose ps

# Healthcheck
curl http://localhost:3000/health
```

## Makefile (se disponível)

```bash
make help      # Ver comandos
make deploy    # Deploy completo
make logs      # Ver logs
make restart   # Reiniciar
make clean     # Limpar
```

## URLs

- **Produção**: https://cadastro.girabot.com.br
- **Local**: http://localhost:3000
- **Health**: /health

## Troubleshooting

```bash
# Container não inicia
docker-compose logs

# 502 Bad Gateway
docker-compose ps
curl http://localhost:3000

# Porta ocupada
sudo lsof -i :3000
```

📖 **Documentação completa**: Veja [DOCKER-DEPLOY.md](./DOCKER-DEPLOY.md)
