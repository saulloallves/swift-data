@echo off
REM =========================================
REM Script de Deploy - Windows
REM =========================================

echo.
echo ========================================
echo Deploy do Sistema de Cadastro
echo ========================================
echo.

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker nao esta instalado!
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose nao esta instalado!
    exit /b 1
)

echo [INFO] Parando containers antigos...
docker-compose down

echo [INFO] Limpando imagens antigas...
docker image prune -f

echo [INFO] Buildando nova imagem...
docker-compose build --no-cache

echo [INFO] Iniciando containers...
docker-compose up -d

echo [INFO] Aguardando healthcheck...
timeout /t 10 /nobreak >nul

echo [INFO] Verificando status...
docker-compose ps

echo.
echo ========================================
echo Deploy concluido!
echo ========================================
echo Container: cadastro-girabot
echo URL Local: http://localhost:3000
echo.
echo Comandos uteis:
echo   docker-compose logs -f     (ver logs)
echo   docker-compose down        (parar)
echo   docker-compose restart     (reiniciar)
echo ========================================
echo.

pause
