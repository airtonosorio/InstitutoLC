Write-Host "=== TESTE COMPLETO DA FUNCIONALIDADE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar servidor
Write-Host "1. Verificando servidor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/alunos" -UseBasicParsing -TimeoutSec 10
    Write-Host "   [OK] Servidor respondendo (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   [ERRO] Servidor nao respondeu: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Verificar página import.html
Write-Host ""
Write-Host "2. Verificando pagina import.html..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/Views/home/import.html" -UseBasicParsing -TimeoutSec 10
    Write-Host "   [OK] Pagina acessivel (Status: $($response.StatusCode))" -ForegroundColor Green
    
    $checks = @{
        "Titulo 'Importar Excel'" = $response.Content -match "Importar Excel"
        "Icone fa-file-import" = $response.Content -match "fa-file-import"
        "Texto importacao atomica" = $response.Content -match "TODOS.*registros"
        "Botao Importar Excel" = $response.Content -match "Importar Excel"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "   [OK] $($check.Key)" -ForegroundColor Green
        } else {
            Write-Host "   [ERRO] $($check.Key)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   [ERRO] Nao foi possivel acessar: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Verificar arquivos Excel
Write-Host ""
Write-Host "3. Verificando arquivos Excel de teste..." -ForegroundColor Yellow
$arquivos = @("exemplo_importacao_alunos.xlsx", "exemplo_importacao_com_erros.xlsx")
foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        $size = (Get-Item $arquivo).Length
        Write-Host "   [OK] $arquivo ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "   [ERRO] $arquivo nao encontrado" -ForegroundColor Red
    }
}

# 4. Verificar endpoint da API
Write-Host ""
Write-Host "4. Verificando endpoint de importacao..." -ForegroundColor Yellow
try {
    # Tentar POST sem arquivo (deve retornar 400)
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/alunos/importar" -Method POST -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "   [OK] Endpoint /api/alunos/importar esta disponivel (retornou 400 como esperado)" -ForegroundColor Green
    } else {
        Write-Host "   [AVISO] Endpoint retornou status: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RESUMO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar manualmente:" -ForegroundColor Yellow
Write-Host "1. Acesse: http://localhost:8080/Views/home/import.html" -ForegroundColor White
Write-Host "2. Clique em 'Importar Excel'" -ForegroundColor White
Write-Host "3. Selecione: exemplo_importacao_alunos.xlsx" -ForegroundColor White
Write-Host "4. Verifique se todos os 10 alunos foram importados" -ForegroundColor White
Write-Host ""
Write-Host "Para testar validacao atomica:" -ForegroundColor Yellow
Write-Host "1. Selecione: exemplo_importacao_com_erros.xlsx" -ForegroundColor White
Write-Host "2. Verifique se nenhum aluno foi importado e erros sao exibidos" -ForegroundColor White
Write-Host ""



