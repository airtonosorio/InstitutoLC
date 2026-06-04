# Instituto LC

Aplicacao com backend em .NET 8, frontend em React/Vite e SQL Server.

## Estrutura

- `InstitutoLC.Api/`: backend .NET
- `frontend/`: codigo-fonte React
- `docker-compose.yml`: stack para subir API e banco

## Rodando com Docker

1. Copie `.env.example` para `.env`.
2. Preencha `SA_PASSWORD`, `JWT_KEY`, `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
3. Rode:

```powershell
docker compose up -d --build
```

4. Acesse `http://localhost:8080`.

## Observacoes

- O build Docker compila o frontend a partir de `frontend/` e copia os arquivos finais para a imagem da API.
- O arquivo `.env` nao deve ser enviado ao repositorio.
- Em producao, use um proxy reverso com HTTPS na frente da aplicacao.

