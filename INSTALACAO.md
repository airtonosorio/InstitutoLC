# Guia de Instalação - Instituto LC API

## Pré-requisitos

### 1. Instalar .NET 8 SDK

**Windows:**

- Download: https://dotnet.microsoft.com/download/dotnet/8.0
- Execute o instalador e siga as instruções

**macOS:**

```bash
brew install dotnet-sdk
```

**Linux (Ubuntu/Debian):**

```bash
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

### 2. Instalar SQL Server

**Windows:**

- Download SQL Server Express: https://www.microsoft.com/sql-server/sql-server-downloads
- Ou use SQL Server LocalDB (incluso no Visual Studio)

**macOS/Linux:**

- Use Docker:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=SuaSenhaForte123!" \
   -p 1433:1433 --name sqlserver \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

## Configuração do Projeto

### 1. Navegue até a pasta do projeto

```bash
cd InstitutoLC.Api
```

### 2. Restaure os pacotes NuGet

```bash
dotnet restore
```

### 3. Configure a Connection String

Edite o arquivo `appsettings.json` ou `appsettings.Development.json`:

**Para SQL Server local (Windows):**

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
    "DefaultConnection": "Server=localhost;Database=InstitutoLC;User Id=sa;Password=SuaSenhaForte123!;TrustServerCertificate=True;"
  }
}
```

**Para Docker:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=InstitutoLC;User Id=sa;Password=SuaSenhaForte123!;TrustServerCertificate=True;"
  }
}
```

### 4. Execute as Migrations

As migrations já foram criadas. Execute o comando para criar o banco de dados:

```bash
dotnet ef database update
```

Se você não tiver o EF Core Tools instalado:

```bash
dotnet tool install --global dotnet-ef
```

### 5. Execute a aplicação

```bash
dotnet run
```

A API estará disponível em:

- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000
- Swagger UI: https://localhost:5001/swagger

## Estrutura do Banco de Dados Criada

### Tabela: Alunos

- Id (PK)
- Nome, DataNascimento, RG, CPF (único)
- Endereco, NumeroEndereco, Bairro, Municipio, Estado
- Escola, TipoEscola, Serie, Turno
- NumeroPessoasCasa
- Contato1, Contato2
- DataCadastro, DataAtualizacao

### Tabela: AnamnesesAlunos

- Id (PK)
- AlunoId (FK, relação 1:1)
- PossuiEnfermidade
- ObservacoesGerais
- DataCadastro, DataAtualizacao

### Tabela: Enfermidades

- Id (PK)
- AnamneseAlunoId (FK, relação 1:N)
- TipoEnfermidade
- Descricao
- DataCadastro

## Testando a API

### 1. Via Swagger UI

Acesse https://localhost:5001/swagger e teste os endpoints diretamente no navegador.

### 2. Via cURL

**Criar um aluno:**

```bash
curl -X POST https://localhost:5001/api/alunos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "dataNascimento": "2012-03-20",
    "rg": "98.765.432-1",
    "cpf": "987.654.321-00",
    "endereco": "Av. Brasil",
    "numeroEndereco": "456",
    "bairro": "Jardim América",
    "municipio": "Rio de Janeiro",
    "estado": "RJ",
    "escola": "Colégio Municipal XYZ",
    "tipoEscola": 1,
    "serie": "7º Ano",
    "turno": 1,
    "numeroPessoasCasa": 5,
    "contato1": "(21) 99999-8888",
    "anamnese": {
      "possuiEnfermidade": true,
      "enfermidades": [
        {
          "tipoEnfermidade": 8,
          "descricao": "Alergia a pólen"
        }
      ]
    }
  }'
```

**Listar todos os alunos:**

```bash
curl https://localhost:5001/api/alunos
```

**Buscar aluno por ID:**

```bash
curl https://localhost:5001/api/alunos/1
```

## Troubleshooting

### Erro de conexão com banco de dados

- Verifique se o SQL Server está rodando
- Confirme a connection string
- Tente adicionar `;TrustServerCertificate=True` na connection string

### Porta já em uso

Altere as portas no arquivo `launchSettings.json` em `Properties/`

### Migrations não aplicadas

Execute:

```bash
dotnet ef database update --verbose
```

## Comandos Úteis

```bash
# Verificar versão do .NET
dotnet --version

# Compilar o projeto
dotnet build

# Executar testes (quando criados)
dotnet test

# Criar nova migration
dotnet ef migrations add NomeDaMigration

# Reverter última migration
dotnet ef migrations remove

# Ver conexões do banco
dotnet ef dbcontext info

# Publicar aplicação
dotnet publish -c Release
```

## Próximos Passos

1. ✅ API funcionando
2. ⚠️ Implementar autenticação/autorização
3. ⚠️ Adicionar testes unitários e de integração
4. ⚠️ Implementar logging estruturado
5. ⚠️ Adicionar paginação nos endpoints de listagem
6. ⚠️ Implementar cache
7. ⚠️ Dockerizar a aplicação
