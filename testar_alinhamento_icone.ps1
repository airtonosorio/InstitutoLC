# Script para testar o alinhamento e hover do ícone de importação
Write-Host "=== Teste de Alinhamento e Hover do Ícone de Importação ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "1. Verificando se o servidor está respondendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/home/home.html" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Servidor está respondendo" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Servidor não está respondendo: $_" -ForegroundColor Red
    exit 1
}

# Verificar arquivos CSS
Write-Host ""
Write-Host "2. Verificando arquivos CSS..." -ForegroundColor Yellow

$cssFiles = @(
    "InstitutoLC.Api\Views\home\css\home.css",
    "InstitutoLC.Api\Views\home\css\config.css",
    "InstitutoLC.Api\Views\home\css\lista.css"
)

$allGood = $true

foreach ($cssFile in $cssFiles) {
    if (Test-Path $cssFile) {
        $content = Get-Content $cssFile -Raw
        
        # Verificar se #config não tem align-self: flex-start
        if ($content -match "align-self:\s*flex-start") {
            Write-Host "   ✗ $cssFile ainda contém 'align-self: flex-start'" -ForegroundColor Red
            $allGood = $false
        } else {
            Write-Host "   ✓ $cssFile não contém 'align-self: flex-start'" -ForegroundColor Green
        }
        
        # Verificar se #config tem hover
        if ($content -match "#config.*hover|#config:hover") {
            Write-Host "   ✓ $cssFile contém hover para #config" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $cssFile não contém hover para #config" -ForegroundColor Red
            $allGood = $false
        }
        
        # Verificar se tem transition
        if ($content -match "transition:\s*all.*0\.3s") {
            Write-Host "   ✓ $cssFile contém transição suave" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ $cssFile não contém transição (pode ser opcional)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✗ Arquivo não encontrado: $cssFile" -ForegroundColor Red
        $allGood = $false
    }
}

# Verificar estrutura HTML
Write-Host ""
Write-Host "3. Verificando estrutura HTML..." -ForegroundColor Yellow

$htmlFiles = @(
    "InstitutoLC.Api\Views\home\home.html",
    "InstitutoLC.Api\Views\home\import.html",
    "InstitutoLC.Api\Views\home\lista.html"
)

foreach ($htmlFile in $htmlFiles) {
    if (Test-Path $htmlFile) {
        $content = Get-Content $htmlFile -Raw
        
        if ($content -match 'id="config"') {
            Write-Host "   ✓ $htmlFile contém id='config'" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $htmlFile não contém id='config'" -ForegroundColor Red
            $allGood = $false
        }
    }
}

# Verificar CSS específico do #config
Write-Host ""
Write-Host "4. Verificando estilos específicos do #config..." -ForegroundColor Yellow

$homeCss = Get-Content "InstitutoLC.Api\Views\home\css\home.css" -Raw

# Verificar se #config não sobrescreve propriedades de layout desnecessariamente
$configBlock = [regex]::Match($homeCss, '\.barraLateral\s+#config\s*\{[^}]+\}').Value

if ($configBlock) {
    Write-Host "   Encontrado bloco #config:" -ForegroundColor Cyan
    Write-Host "   $configBlock" -ForegroundColor Gray
    
    # Verificar se não tem propriedades problemáticas
    if ($configBlock -match "align-self:\s*flex-start|position:\s*relative|top:\s*auto|bottom:\s*auto") {
        Write-Host "   ✗ Bloco #config contém propriedades problemáticas" -ForegroundColor Red
        $allGood = $false
    } else {
        Write-Host "   ✓ Bloco #config não contém propriedades problemáticas" -ForegroundColor Green
    }
    
    # Verificar se tem hover
    $hoverBlock = [regex]::Match($homeCss, '\.barraLateral\s+#config:hover\s*\{[^}]+\}').Value
    if ($hoverBlock) {
        Write-Host "   ✓ Hover encontrado para #config" -ForegroundColor Green
        Write-Host "   $hoverBlock" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Hover não encontrado para #config" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ✗ Bloco #config não encontrado" -ForegroundColor Red
    $allGood = $false
}

# Resumo final
Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ Todas as verificações passaram!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse http://localhost:8080/home/home.html no navegador" -ForegroundColor White
    Write-Host "2. Verifique visualmente se o ícone de importação está alinhado" -ForegroundColor White
    Write-Host "3. Passe o mouse sobre o ícone e verifique o efeito hover" -ForegroundColor White
} else {
    Write-Host "✗ Algumas verificações falharam. Revise os erros acima." -ForegroundColor Red
}


