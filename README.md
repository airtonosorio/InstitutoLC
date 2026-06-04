# Instituto LC - API de Cadastro de Alunos

API RESTful desenvolvida em .NET 8 para cadastro e gerenciamento de alunos de uma instituição de ensino.

## 📋 Funcionalidades

- **Cadastro completo de alunos** incluindo:

  - Dados pessoais (Nome, Data de Nascimento, RG, CPF)
  - Endereço completo
  - Informações escolares (Escola, Tipo, Série, Turno)
  - Dados familiares (Número de pessoas na casa)
  - Contatos
  - Anamnese médica com enfermidades

- **Operações CRUD completas**:
  - Listar todos os alunos
  - Buscar aluno por ID
  - Criar novo aluno
  - Atualizar aluno existente
  - Deletar aluno

## 🚀 Tecnologias Utilizadas

- .NET 8
- Entity Framework Core 8
- SQL Server
- Swagger/OpenAPI

## 📦 Estrutura do Projeto

```
InstitutoLC.Api/
├── Controllers/
│   └── AlunosController.cs
├── Data/
│   └── InstitutoDbContext.cs
├── Models/
│   ├── Entities/
│   │   ├── Aluno.cs
│   │   ├── AnamneseAluno.cs
│   │   └── Enfermidade.cs
│   ├── Enums/
│   │   ├── TipoEscola.cs
│   │   ├── Turno.cs
│   │   └── TipoEnfermidade.cs
│   └── DTOs/
│       ├── CriarAlunoRequest.cs
│       ├── AtualizarAlunoRequest.cs
│       ├── AlunoResponse.cs
│       ├── AnamneseDto.cs
│       └── EnfermidadeDto.cs
├── Migrations/
├── Program.cs
└── appsettings.json
```

## 🔧 Configuração

### Pré-requisitos

- .NET 8 SDK
- SQL Server (LocalDB ou completo)

### Instalação

1. Clone o repositório

2. O appsettings.json já está configurado para uso com Docker

3. O Docker já executa o build e sobe tanto a API quanto o banco de dados automaticamente.
Nenhum comando dotnet é necessário para rodar o projeto localmente.

4. Acesse o Swagger UI:

```
http://localhost:8080/swagger/index.html
```

## 📝 Endpoints da API

### Alunos

- `GET /api/alunos` - Lista todos os alunos
- `GET /api/alunos/{id}` - Busca aluno por ID
- `POST /api/alunos` - Cria novo aluno
- `PUT /api/alunos/{id}` - Atualiza aluno existente
- `DELETE /api/alunos/{id}` - Deleta aluno

### Exemplo de Request - Criar Aluno

```json
{
  "nome": "João Silva",
  "dataNascimento": "2010-05-15",
  "rg": "12.345.678-9",
  "cpf": "123.456.789-00",
  "endereco": "Rua das Flores",
  "numeroEndereco": "123",
  "bairro": "Centro",
  "municipio": "São Paulo",
  "estado": "SP",
  "escola": "Escola Estadual ABC",
  "tipoEscola": 1,
  "serie": "5º Ano",
  "turno": 1,
  "numeroPessoasCasa": 4,
  "contato1": "(11) 98765-4321",
  "contato2": "(11) 3456-7890",
  "anamnese": {
    "possuiEnfermidade": true,
    "observacoesGerais": "Necessita acompanhamento",
    "enfermidades": [
      {
        "tipoEnfermidade": 1,
        "descricao": "Bronquite leve"
      }
    ]
  }
}
```

## 🏥 Tipos de Enfermidades

1. Bronquite/Asma
2. Doença de Coração
3. Epilepsia/Convulsões
4. Diabetes
5. Problema Auditivo
6. Problema Visual
7. Doença Ortopédica
8. Alergia
9. Outros

## 🏫 Tipos de Escola

1. Pública
2. Privada

## 📅 Turnos

1. Matutino
2. Vespertino
3. Noturno
4. Integral

## 🔐 Validações

- CPF é único no sistema
- Todos os campos obrigatórios são validados
- Estado deve ter 2 caracteres (sigla)
- Número de pessoas na casa deve estar entre 1 e 50

## 📄 Licença

Este projeto é de código aberto.
