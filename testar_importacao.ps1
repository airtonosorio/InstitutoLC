# Script para testar a funcionalidade de importação
Write-Host "=== Teste de Importacao de Excel ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "1. Verificando se o servidor esta rodando..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/alunos" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Servidor esta rodando na porta 8080" -ForegroundColor Green
        $serverRunning = $true
    }
} catch {
    Write-Host "   [ERRO] Servidor nao esta respondendo na porta 8080" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

if (-not $serverRunning) {
    Write-Host ""
    Write-Host "Por favor, inicie o servidor antes de continuar." -ForegroundColor Yellow
    exit 1
}

# Verificar se a página import.html está acessível
Write-Host ""
Write-Host "2. Verificando se a pagina import.html esta acessivel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/Views/home/import.html" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   [OK] Pagina import.html esta acessivel" -ForegroundColor Green
        
        # Verificar se contém o ícone correto
        if ($response.Content -match "fa-file-import") {
            Write-Host "   [OK] Icone de importacao encontrado" -ForegroundColor Green
        } else {
            Write-Host "   [AVISO] Icone de importacao nao encontrado" -ForegroundColor Yellow
        }
        
        # Verificar se contém o texto sobre importação atômica
        if ($response.Content -match "TODOS.*registros") {
            Write-Host "   [OK] Texto sobre importacao atomica encontrado" -ForegroundColor Green
        } else {
            Write-Host "   [AVISO] Texto sobre importacao atomica nao encontrado" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   [ERRO] Nao foi possivel acessar a pagina import.html" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar se os arquivos Excel de teste existem
Write-Host ""
Write-Host "3. Verificando arquivos Excel de teste..." -ForegroundColor Yellow
$arquivoValido = "exemplo_importacao_alunos.xlsx"
$arquivoComErros = "exemplo_importacao_com_erros.xlsx"

if (Test-Path $arquivoValido) {
    $size = (Get-Item $arquivoValido).Length
    Write-Host "   [OK] Arquivo valido encontrado: $arquivoValido ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "   [ERRO] Arquivo valido nao encontrado: $arquivoValido" -ForegroundColor Red
    Write-Host "   Execute: python gerar_excel_teste.py" -ForegroundColor Yellow
}

if (Test-Path $arquivoComErros) {
    $size = (Get-Item $arquivoComErros).Length
    Write-Host "   [OK] Arquivo com erros encontrado: $arquivoComErros ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "   [ERRO] Arquivo com erros nao encontrado: $arquivoComErros" -ForegroundColor Red
    Write-Host "   Execute: python gerar_excel_com_erros.py" -ForegroundColor Yellow
}

# Verificar endpoint da API
Write-Host ""
Write-Host "4. Verificando endpoint da API de importacao..." -ForegroundColor Yellow
try {
    # Testar se o endpoint existe (deve retornar erro 400 se não enviar arquivo, mas isso confirma que existe)
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/alunos/importar" -Method POST -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "   [OK] Endpoint /api/alunos/importar esta disponivel (retornou 400 como esperado sem arquivo)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "   [ERRO] Endpoint /api/alunos/importar nao encontrado (404)" -ForegroundColor Red
    } else {
        Write-Host "   [INFO] Endpoint retornou status: $statusCode" -ForegroundColor Yellow
    }
}

# Resumo
Write-Host ""
Write-Host "=== Resumo ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar manualmente:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:8080/Views/home/import.html" -ForegroundColor White
Write-Host "2. Clique no botao 'Importar Excel'" -ForegroundColor White
Write-Host "3. Selecione o arquivo: exemplo_importacao_alunos.xlsx" -ForegroundColor White
Write-Host "4. Verifique se todos os 10 alunos foram importados" -ForegroundColor White
Write-Host ""
Write-Host "Para testar validacao atomica:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:8080/Views/home/import.html" -ForegroundColor White
Write-Host "2. Clique no botao 'Importar Excel'" -ForegroundColor White
Write-Host "3. Selecione o arquivo: exemplo_importacao_com_erros.xlsx" -ForegroundColor White
Write-Host "4. Verifique se nenhum aluno foi importado e os erros sao exibidos" -ForegroundColor White
Write-Host ""



