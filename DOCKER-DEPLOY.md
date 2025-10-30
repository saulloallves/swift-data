# 🐳 Guia de Deploy com Docker - Sistema de Cadastro

Este guia contém todas as instruções para fazer deploy do Sistema de Cadastro de Franqueados usando Docker em um servidor VPS.

---

## 📋 Pré-requisitos

### No Servidor VPS:
- Ubuntu 20.04+ (ou similar)
- Docker 20.10+
- Docker Compose 1.29+
- Nginx instalado no host
- Acesso root ou sudo
- Domínio apontando para o servidor: `cadastro.girabot.com.br`

---

## 🚀 Instalação Rápida no VPS

### 1. Instalar Docker

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório do Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verificar instalação
docker --version

# Adicionar usuário ao grupo docker (opcional)
sudo usermod -aG docker $USER
```

### 2. Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### 3. Instalar e Configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Verificar status
sudo systemctl status nginx

# Habilitar para iniciar com o sistema
sudo systemctl enable nginx
```

---

## 📦 Deploy da Aplicação

### 1. Clonar Repositório no Servidor

```bash
# Criar diretório para aplicações
sudo mkdir -p /opt/apps
cd /opt/apps

# Clonar repositório
git clone https://github.com/saulloallves/swift-data.git cadastro-app
cd cadastro-app

# Dar permissão de execução ao script de deploy
chmod +x deploy.sh
```

### 2. Executar Deploy

```bash
# Opção 1: Usando o script automatizado
./deploy.sh

# Opção 2: Manualmente
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 3. Verificar se Container Está Rodando

```bash
# Ver containers rodando
docker-compose ps

# Ver logs
docker-compose logs -f

# Verificar healthcheck
curl http://localhost:3001/health
```

---

## 🌐 Configurar Nginx como Proxy Reverso

### 1. Criar Arquivo de Configuração

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/cadastro.girabot.com.br
```

**Cole o conteúdo do arquivo `nginx-vps.conf`** (mas sem as partes de SSL por enquanto):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name cadastro.girabot.com.br;
    
    # Logs
    access_log /var/log/nginx/cadastro-girabot-access.log;
    error_log /var/log/nginx/cadastro-girabot-error.log;
    
    # Proxy para o container Docker
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        access_log off;
        proxy_pass http://localhost:3001/health;
    }
}
```

### 2. Ativar Configuração

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/cadastro.girabot.com.br /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 3. Testar Acesso

```bash
# Testar localmente
curl http://cadastro.girabot.com.br

# Ou abra no navegador
# http://cadastro.girabot.com.br
```

---

## 🔒 Configurar SSL/HTTPS com Certbot

### 1. Instalar Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado SSL

```bash
# Gerar certificado automaticamente
sudo certbot --nginx -d cadastro.girabot.com.br

# Seguir instruções na tela:
# - Fornecer email
# - Aceitar termos
# - Escolher "Redirect" para redirecionar HTTP para HTTPS
```

### 3. Verificar Renovação Automática

```bash
# Testar renovação (dry-run)
sudo certbot renew --dry-run

# Certbot cria um cron job automaticamente
# Verificar:
sudo systemctl status certbot.timer
```

### 4. Atualizar Configuração do Nginx

Após gerar o certificado, o Certbot atualiza automaticamente o arquivo de configuração. Mas você pode verificar:

```bash
sudo nano /etc/nginx/sites-available/cadastro.girabot.com.br
```

Deve conter algo como:

```nginx
server {
    listen 443 ssl http2;
    server_name cadastro.girabot.com.br;
    
    ssl_certificate /etc/letsencrypt/live/cadastro.girabot.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cadastro.girabot.com.br/privkey.pem;
    
    # ... resto da configuração
}

server {
    listen 80;
    server_name cadastro.girabot.com.br;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔄 Atualizações e Manutenção

### Atualizar Aplicação

```bash
cd /opt/apps/cadastro-app

# Puxar alterações
git pull origin main

# Fazer deploy
./deploy.sh
```

### Ver Logs

```bash
# Logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100

# Logs do Nginx
sudo tail -f /var/log/nginx/cadastro-girabot-access.log
sudo tail -f /var/log/nginx/cadastro-girabot-error.log
```

### Reiniciar Serviços

```bash
# Reiniciar container
docker-compose restart

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar tudo
docker-compose restart && sudo systemctl restart nginx
```

### Limpar Recursos

```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não usadas
docker image prune -f

# Limpar volumes não usados (cuidado!)
docker volume prune -f

# Limpar tudo (CUIDADO!)
docker system prune -af
```

---

## 📊 Monitoramento

### Verificar Status

```bash
# Status do container
docker-compose ps

# Uso de recursos
docker stats cadastro-girabot

# Healthcheck
curl http://localhost:3001/health
curl https://cadastro.girabot.com.br/health
```

### Métricas do Nginx

```bash
# Ver logs de acesso
sudo tail -n 100 /var/log/nginx/cadastro-girabot-access.log

# Contar requisições por IP
sudo awk '{print $1}' /var/log/nginx/cadastro-girabot-access.log | sort | uniq -c | sort -rn | head -10

# Contar códigos de status
sudo awk '{print $9}' /var/log/nginx/cadastro-girabot-access.log | sort | uniq -c | sort -rn
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs completos
docker-compose logs

# Ver status detalhado
docker inspect cadastro-girabot

# Testar build
docker-compose build --no-cache
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar se container está rodando
docker-compose ps

# Verificar se porta 3000 está aberta
curl http://localhost:3001

# Ver logs do Nginx
sudo tail -f /var/log/nginx/cadastro-girabot-error.log
```

### Certificado SSL expirado

```bash
# Renovar manualmente
sudo certbot renew

# Forçar renovação
sudo certbot renew --force-renewal

# Recarregar Nginx
sudo systemctl reload nginx
```

### Porta 3000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000

# Ou
sudo netstat -tulpn | grep :3000

# Matar processo
sudo kill -9 <PID>
```

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

Se precisar adicionar variáveis de ambiente, crie um arquivo `.env`:

```bash
# Criar arquivo .env
nano .env
```

```env
NODE_ENV=production
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave
```

Atualizar `docker-compose.yml`:

```yaml
services:
  cadastro-app:
    # ...
    env_file:
      - .env
```

### Limitar Recursos do Container

```yaml
services:
  cadastro-app:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Backup Automático

```bash
# Criar script de backup
sudo nano /opt/scripts/backup-cadastro.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/cadastro"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup dos logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/log/nginx/cadastro-*

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Dar permissão
sudo chmod +x /opt/scripts/backup-cadastro.sh

# Adicionar ao crontab
sudo crontab -e
```

Adicionar linha:
```
0 2 * * * /opt/scripts/backup-cadastro.sh
```

---

## 📝 Checklist de Deploy

- [ ] Docker e Docker Compose instalados
- [ ] Nginx instalado e configurado
- [ ] Repositório clonado em `/opt/apps/cadastro-app`
- [ ] DNS configurado (`cadastro.girabot.com.br` → IP do servidor)
- [ ] Container buildado e rodando (`docker-compose ps`)
- [ ] Nginx configurado como proxy reverso
- [ ] Teste de acesso HTTP funcionando
- [ ] Certificado SSL instalado com Certbot
- [ ] HTTPS funcionando e redirecionando de HTTP
- [ ] Healthcheck respondendo (`/health`)
- [ ] Logs sendo gerados corretamente
- [ ] Monitoramento configurado
- [ ] Backup automático configurado (opcional)

---

## 📞 Suporte

Em caso de problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar status: `docker-compose ps`
3. Testar healthcheck: `curl http://localhost:3001/health`
4. Verificar Nginx: `sudo nginx -t`
5. Ver logs Nginx: `sudo tail -f /var/log/nginx/cadastro-girabot-error.log`

---

## 🎯 URLs de Acesso

- **Produção**: https://cadastro.girabot.com.br
- **Healthcheck**: https://cadastro.girabot.com.br/health
- **Container**: http://localhost:3001

---

✨ **Deploy concluído com sucesso!** 🚀
