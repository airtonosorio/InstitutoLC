# Guia de Teste Docker

## Pré-requisitos

1. **Docker Desktop instalado e rodando**
   - Verifique se o Docker Desktop está em execução
   - O ícone do Docker deve aparecer na bandeja do sistema

2. **Arquivo .env configurado**
   - Copie o arquivo `.env.example` para `.env` (se não existir)
   - Defina uma senha forte para o SQL Server:
     ```
     SA_PASSWORD=YourStrong@Password123
     ```

## Testando os Arquivos Docker

### 1. Verificar Configuração

```bash
cd InstitutoLC.Api
docker-compose config
```

Este comando valida a sintaxe do `docker-compose.yml` sem executar os containers.

### 2. Build da Imagem da API

```bash
docker-compose build api
```

Este comando constrói a imagem Docker da aplicação .NET.

### 3. Iniciar os Containers

```bash
docker-compose up -d
```

Este comando:
- Inicia o container do SQL Server
- Inicia o container da API
- Aplica as migrações automaticamente

### 4. Verificar Logs

```bash
# Logs da API
docker-compose logs api

# Logs do Banco de Dados
docker-compose logs db

# Logs de ambos
docker-compose logs -f
```

### 5. Testar a Aplicação

Após iniciar os containers, acesse:

- **API**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger
- **Frontend**: http://localhost:8080/Views/home/home.html

### 6. Parar os Containers

```bash
docker-compose down
```

Para remover também os volumes (dados do banco):

```bash
docker-compose down -v
```

## Estrutura dos Arquivos Docker

### Dockerfile
- **Build Stage**: Compila a aplicação .NET 8
- **Runtime Stage**: Imagem final otimizada com apenas runtime
- **Views**: Pasta Views copiada para servir arquivos estáticos

### docker-compose.yml
- **db**: Container do SQL Server 2022
- **api**: Container da aplicação .NET
- **Portas**:
  - SQL Server: 1433
  - API: 8080 (mapeado para 80 interno)

## Troubleshooting

### Erro: "Docker Desktop não está rodando"
- Inicie o Docker Desktop
- Aguarde até que o ícone fique verde na bandeja

### Erro: "Port already in use"
- Verifique se a porta 8080 ou 1433 já está em uso
- Altere as portas no `docker-compose.yml` se necessário

### Erro: "Cannot connect to database"
- Aguarde alguns segundos após iniciar o container do banco
- O SQL Server precisa de tempo para inicializar
- A aplicação tenta reconectar automaticamente (até 10 tentativas)

### Erro: "SA_PASSWORD não definida"
- Crie o arquivo `.env` com a variável `SA_PASSWORD`
- Use uma senha forte (mínimo 8 caracteres, maiúsculas, minúsculas, números e símbolos)

## Validação Rápida

Execute este script para validar tudo:

```bash
# 1. Verificar Docker
docker --version
docker-compose --version

# 2. Verificar configuração
docker-compose config

# 3. Build
docker-compose build

# 4. Iniciar
docker-compose up -d

# 5. Verificar status
docker-compose ps

# 6. Testar API
curl http://localhost:8080/api/alunos
```

