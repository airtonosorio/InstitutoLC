# Instituto LC

Sistema simples para cadastro e gerenciamento de alunos, com API em .NET 8, SQL Server em Docker e interface web estática.

## Como rodar

1. Na raiz do projeto, crie o arquivo `.env` usando o `.env.example` como base.

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Ou manualmente, criando um arquivo chamado `.env`.

```env
SA_PASSWORD=SuaSenhaForte123!
```

2. Escolha uma senha forte para `SA_PASSWORD`.

Regras importantes:
- use pelo menos 8 caracteres
- misture letra maiuscula, letra minuscula, numero e simbolo
- evite aspas e espacos

3. Suba os containers na raiz do repositório:

```bash
docker compose up -d
```

4. Abra no navegador:

```text
http://localhost:8080
```

## O que vai acontecer

- o Docker sobe um SQL Server
- a API sobe junto
- a aplicacao tenta criar/aplicar as migrations automaticamente
- a interface web abre direto pela raiz

## Estrutura atual

Tudo que faz a aplicacao rodar ficou na raiz:

- `Program.cs`
- `InstitutoLC.Api.csproj`
- `docker-compose.yml`
- `Dockerfile`
- `appsettings.json`
- `Controllers/`
- `Data/`
- `Models/`
- `Migrations/`
- `Views/`

Arquivos extras ficaram separados:

- `exemplos/` para planilhas de exemplo
- `docs/legado/` para documentacao antiga que foi preservada

## Arquivo .env

O `.env` precisa ficar na raiz do projeto, no mesmo lugar do `docker-compose.yml`.

Estrutura correta:

```text
InstitutoLC/
|-- .env
|-- docker-compose.yml
|-- Dockerfile
|-- Program.cs
|-- Views/
```

Se o `.env` ficar em outra pasta, o Docker Compose nao vai ler a senha.

## Acessos uteis

- Sistema: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`
- Tela principal: `http://localhost:8080/home/home.html`

## Se algo der errado

- confira se o Docker Desktop esta aberto
- confira se a porta `8080` nao esta em uso
- confira se a porta `1433` nao esta em uso
- confira se o arquivo `.env` esta na raiz
- confira se a senha do `.env` segue as regras do SQL Server

## Observacao

Se quiser apagar tudo e subir de novo depois:

```bash
docker compose down -v
docker compose up -d
```
