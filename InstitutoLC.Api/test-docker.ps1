# Script de teste Docker para Windows PowerShell
# Execute: .\test-docker.ps1

Write-Host "=== Teste de Configuração Docker ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✓ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar Docker Compose
Write-Host "2. Verificando Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "   ✓ Docker Compose instalado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker Compose não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar Docker Desktop rodando
Write-Host "3. Verificando Docker Desktop..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "   ✓ Docker Desktop está rodando" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker Desktop não está rodando!" -ForegroundColor Red
    Write-Host "   Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Yellow
    exit 1
}

# Verificar arquivo .env
Write-Host "4. Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "SA_PASSWORD=") {
        Write-Host "   ✓ Arquivo .env encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Arquivo .env existe mas não contém SA_PASSWORD" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠ Arquivo .env não encontrado" -ForegroundColor Yellow
    Write-Host "   Criando arquivo .env com senha padrão..." -ForegroundColor Yellow
    "SA_PASSWORD=TestPassword123!" | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host "   ✓ Arquivo .env criado" -ForegroundColor Green
}

# Validar docker-compose.yml
Write-Host "5. Validando docker-compose.yml..." -ForegroundColor Yellow
try {
    docker-compose config | Out-Null
    Write-Host "   ✓ docker-compose.yml válido" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Erro na configuração do docker-compose.yml" -ForegroundColor Red
    exit 1
}

# Verificar Dockerfile
Write-Host "6. Verificando Dockerfile..." -ForegroundColor Yellow
if (Test-Path "Dockerfile") {
    Write-Host "   ✓ Dockerfile encontrado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Dockerfile não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Todas as verificações passaram! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. docker-compose build" -ForegroundColor White
Write-Host "  2. docker-compose up -d" -ForegroundColor White
Write-Host "  3. docker-compose logs -f" -ForegroundColor White
Write-Host ""

