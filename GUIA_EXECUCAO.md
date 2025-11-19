# 🚀 Guia de Execução - Instituto Lucimário Caitano

Este guia apresenta as diferentes formas de executar a aplicação e acessar o sistema.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Opção 1: Executar com Docker (Recomendado)](#opção-1-executar-com-docker-recomendado)
3. [Opção 2: Executar sem Docker](#opção-2-executar-sem-docker)
4. [Acessando o Sistema](#acessando-o-sistema)
5. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Para Docker (Opção 1):
- ✅ **Docker Desktop** instalado e rodando
  - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - macOS: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: Instale via gerenciador de pacotes

### Para Execução Direta (Opção 2):
- ✅ **.NET 8 SDK** instalado
  - Verificar instalação: `dotnet --version` (deve retornar 8.x.x)
  - Download: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- ✅ **SQL Server** instalado e rodando
  - SQL Server Express ou LocalDB (Windows)
  - Ou SQL Server via Docker

---

## Opção 1: Executar com Docker (Recomendado)

Esta é a forma mais simples e recomendada, pois não requer instalação de dependências adicionais.

### Passo 1: Preparar o Ambiente

1. **Navegue até a pasta do projeto:**
   ```bash
   cd InstitutoLC.Api
   ```

2. **Crie um arquivo `.env` na pasta `InstitutoLC.Api`** (se não existir):
   ```env
   SA_PASSWORD=SuaSenhaForte123!
   ```
   > ⚠️ **Importante:** Use uma senha forte em produção. A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.

### Passo 2: Executar com Docker Compose

**Windows (PowerShell):**
```powershell
# Verificar se Docker está rodando
docker info

# Fazer build e iniciar os containers
docker-compose up -d --build
```

**Linux/macOS:**
```bash
# Verificar se Docker está rodando
docker info

# Fazer build e iniciar os containers
docker-compose up -d --build
```

### Passo 3: Verificar se está Funcionando

```bash
# Ver logs dos containers
docker-compose logs -f

# Verificar status dos containers
docker-compose ps
```

Você deve ver:
- ✅ Container `instituto-sql` rodando (SQL Server)
- ✅ Container `instituto-api` rodando (API .NET)

### Passo 4: Aguardar Inicialização

⏱️ **Aguarde 30-60 segundos** para:
- SQL Server inicializar completamente
- Aplicação conectar ao banco
- Migrações serem aplicadas automaticamente

Você verá no log: `"Migrações aplicadas com sucesso!"`

---

## Opção 2: Executar sem Docker

### Passo 1: Configurar o Banco de Dados

1. **Certifique-se de que o SQL Server está rodando**

2. **Configure a connection string** no arquivo `appsettings.json` ou `appsettings.Development.json`:

   **Para SQL Server local (Windows Authentication):**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=InstitutoLC;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

   **Para SQL Server com usuário/senha:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=InstitutoLC;User Id=sa;Password=SuaSenha;TrustServerCertificate=True;"
     }
   }
   ```

### Passo 2: Restaurar Dependências

```bash
cd InstitutoLC.Api
dotnet restore
```

### Passo 3: Aplicar Migrações

```bash
# Instalar EF Core Tools (se ainda não tiver)
dotnet tool install --global dotnet-ef

# Aplicar migrações ao banco de dados
dotnet ef database update
```

### Passo 4: Executar a Aplicação

```bash
dotnet run
```

A aplicação iniciará e você verá mensagens como:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
      Now listening on: https://localhost:5001
```

---

## Acessando o Sistema

### 🌐 Acessar o Site (Interface Web)

Após a aplicação estar rodando, acesse:

#### Com Docker:
```
http://localhost:8080
```

#### Sem Docker:
```
http://localhost:5000
ou
https://localhost:5001
```

### 📄 Páginas Disponíveis

1. **Página Principal (Home):**
   - URL: `http://localhost:8080/Views/home/home.html`
   - Funcionalidades:
     - Dashboard com gráficos
     - Adicionar aluno
     - Adicionar alunos em massa
     - Visualizar estatísticas

2. **Lista de Alunos:**
   - URL: `http://localhost:8080/Views/home/lista.html`
   - Funcionalidades:
     - Listar todos os alunos
     - Editar aluno
     - Deletar aluno
     - Adicionar novo aluno

3. **Configurações:**
   - URL: `http://localhost:8080/Views/home/config.html`
   - Funcionalidades:
     - Importar alunos via Excel
     - Exportar alunos para CSV

4. **Login (se implementado):**
   - URL: `http://localhost:8080/Views/login/login.html`

### 🔧 Acessar a API (Swagger)

Para testar a API diretamente:

#### Com Docker:
```
http://localhost:8080/swagger
```

#### Sem Docker:
```
https://localhost:5001/swagger
ou
http://localhost:5000/swagger
```

### 📡 Endpoints da API

A API está disponível em:

#### Com Docker:
```
http://localhost:8080/api/alunos
```

#### Sem Docker:
```
http://localhost:5000/api/alunos
ou
https://localhost:5001/api/alunos
```

**Endpoints disponíveis:**
- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/{id}` - Buscar aluno por ID
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/{id}` - Atualizar aluno
- `DELETE /api/alunos/{id}` - Deletar aluno
- `POST /api/alunos/importar` - Importar alunos via Excel

---

## Troubleshooting

### ❌ Problema: Docker não inicia

**Solução:**
1. Verifique se o Docker Desktop está rodando
2. Reinicie o Docker Desktop
3. Verifique se há outros serviços usando as portas 1433 ou 8080

```bash
# Verificar portas em uso (Windows)
netstat -ano | findstr :8080
netstat -ano | findstr :1433

# Verificar portas em uso (Linux/macOS)
lsof -i :8080
lsof -i :1433
```

### ❌ Problema: Erro de conexão com banco de dados

**Solução:**
1. Aguarde mais tempo (SQL Server pode levar até 60 segundos para inicializar)
2. Verifique os logs: `docker-compose logs db`
3. Verifique se a senha no `.env` está correta
4. Tente reiniciar os containers:

```bash
docker-compose down
docker-compose up -d
```

### ❌ Problema: Porta 8080 já está em uso

**Solução:**
1. Altere a porta no `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:80"  # Mude 8080 para 8081
   ```
2. Ou pare o serviço que está usando a porta 8080

### ❌ Problema: Migrações não são aplicadas

**Solução:**
1. Verifique os logs: `docker-compose logs api`
2. Se estiver sem Docker, execute manualmente:
   ```bash
   dotnet ef database update --verbose
   ```

### ❌ Problema: Página não carrega (404)

**Solução:**
1. Verifique se está acessando a URL correta:
   - ✅ `http://localhost:8080/Views/home/home.html`
   - ❌ `http://localhost:8080/home.html` (incorreto)
2. Verifique se os arquivos estão na pasta `Views`
3. Verifique os logs do container: `docker-compose logs api`

### ❌ Problema: Erro "Cannot connect to database"

**Solução:**
1. Verifique se o SQL Server está rodando:
   ```bash
   docker-compose ps
   ```
2. Verifique a connection string no `appsettings.json`
3. Tente conectar manualmente ao SQL Server para testar

---

## Comandos Úteis

### Docker Compose

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs apenas da API
docker-compose logs -f api

# Ver logs apenas do banco
docker-compose logs -f db

# Reconstruir containers
docker-compose up -d --build

# Parar e remover volumes (⚠️ apaga dados)
docker-compose down -v

# Ver status dos containers
docker-compose ps
```

### .NET (sem Docker)

```bash
# Verificar versão
dotnet --version

# Restaurar pacotes
dotnet restore

# Compilar
dotnet build

# Executar
dotnet run

# Aplicar migrações
dotnet ef database update

# Criar nova migração
dotnet ef migrations add NomeDaMigration
```

---

## Estrutura de URLs

### Com Docker (porta 8080):
```
http://localhost:8080/                          → Página inicial (se configurada)
http://localhost:8080/Views/home/home.html       → Dashboard
http://localhost:8080/Views/home/lista.html     → Lista de alunos
http://localhost:8080/Views/home/config.html    → Configurações
http://localhost:8080/Views/login/login.html    → Login
http://localhost:8080/swagger                   → Documentação da API
http://localhost:8080/api/alunos                → Endpoint da API
```

### Sem Docker (porta 5000/5001):
```
http://localhost:5000/Views/home/home.html       → Dashboard
http://localhost:5000/Views/home/lista.html     → Lista de alunos
http://localhost:5000/Views/home/config.html    → Configurações
http://localhost:5000/swagger                   → Documentação da API
http://localhost:5000/api/alunos                → Endpoint da API
```

---

## Próximos Passos

Após acessar o sistema:

1. ✅ **Teste o cadastro de alunos** na página principal
2. ✅ **Visualize a lista** de alunos cadastrados
3. ✅ **Teste a importação** de Excel na página de configurações
4. ✅ **Explore a API** através do Swagger
5. ✅ **Verifique os gráficos** no dashboard

---

## Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f` (com Docker) ou console (sem Docker)
2. Consulte a documentação em `README.md` e `INSTALACAO.md`
3. Verifique se todas as dependências estão instaladas corretamente

---

**Desenvolvido para o Instituto Lucimário Caitano** 🎓

