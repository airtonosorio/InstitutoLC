# Exemplos de Uso da API - Instituto LC

## 📋 Exemplos de Requisições

### 1. Criar Aluno Completo (com Anamnese)

```json
POST /api/alunos
Content-Type: application/json

{
  "nome": "João Pedro Silva",
  "dataNascimento": "2010-05-15T00:00:00",
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
    "observacoesGerais": "Necessita acompanhamento médico regular",
    "enfermidades": [
      {
        "tipoEnfermidade": 1,
        "descricao": "Bronquite leve, tratada com bombinha"
      },
      {
        "tipoEnfermidade": 8,
        "descricao": "Alergia a pólen e poeira"
      }
    ]
  }
}
```

**Resposta (201 Created):**

```json
{
  "id": 1,
  "nome": "João Pedro Silva",
  "dataNascimento": "2010-05-15T00:00:00",
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
    "id": 1,
    "possuiEnfermidade": true,
    "observacoesGerais": "Necessita acompanhamento médico regular",
    "enfermidades": [
      {
        "id": 1,
        "tipoEnfermidade": 1,
        "descricao": "Bronquite leve, tratada com bombinha"
      },
      {
        "id": 2,
        "tipoEnfermidade": 8,
        "descricao": "Alergia a pólen e poeira"
      }
    ]
  },
  "dataCadastro": "2025-10-10T10:30:00",
  "dataAtualizacao": null
}
```

---

### 2. Criar Aluno Sem Anamnese

```json
POST /api/alunos
Content-Type: application/json

{
  "nome": "Maria Santos",
  "dataNascimento": "2012-08-20T00:00:00",
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
  "turno": 2,
  "numeroPessoasCasa": 3,
  "contato1": "(21) 99999-8888"
}
```

---

### 3. Listar Todos os Alunos

```http
GET /api/alunos
```

**Resposta (200 OK):**

```json
[
  {
    "id": 1,
    "nome": "João Pedro Silva",
    "dataNascimento": "2010-05-15T00:00:00",
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
    "anamnese": { ... },
    "dataCadastro": "2025-10-10T10:30:00",
    "dataAtualizacao": null
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    ...
  }
]
```

---

### 4. Buscar Aluno por ID

```http
GET /api/alunos/1
```

**Resposta (200 OK):** Retorna objeto do aluno completo

**Resposta (404 Not Found):**

```json
{
  "message": "Aluno não encontrado"
}
```

---

### 5. Atualizar Aluno (Parcial)

```json
PUT /api/alunos/1
Content-Type: application/json

{
  "endereco": "Rua Nova",
  "numeroEndereco": "789",
  "contato2": "(11) 2222-3333",
  "anamnese": {
    "possuiEnfermidade": true,
    "observacoesGerais": "Atualizado - Melhorou dos sintomas",
    "enfermidades": [
      {
        "tipoEnfermidade": 1,
        "descricao": "Bronquite controlada"
      }
    ]
  }
}
```

> **Nota:** Na atualização, você só precisa enviar os campos que deseja alterar.

---

### 6. Deletar Aluno

```http
DELETE /api/alunos/1
```

**Resposta (204 No Content):** Aluno deletado com sucesso

**Resposta (404 Not Found):**

```json
{
  "message": "Aluno não encontrado"
}
```

---

## 📝 Enums - Valores Possíveis

### TipoEscola

```
1 = Publica
2 = Privada
```

### Turno

```
1 = Matutino
2 = Vespertino
3 = Noturno
4 = Integral
```

### TipoEnfermidade

```
1 = BronquiteAsma
2 = DoencaCoracao
3 = EpilepsiaConvulsoes
4 = Diabetes
5 = ProblemaAuditivo
6 = ProblemaVisual
7 = DoencaOrtopedica
8 = Alergia
9 = Outros
```

---

## 🧪 Exemplos de Casos de Uso

### Caso 1: Aluno de Escola Pública com Diabetes

```json
{
  "nome": "Carlos Eduardo Oliveira",
  "dataNascimento": "2009-11-03T00:00:00",
  "rg": "45.678.901-2",
  "cpf": "456.789.012-34",
  "endereco": "Rua do Comércio",
  "numeroEndereco": "88",
  "bairro": "Vila Nova",
  "municipio": "Belo Horizonte",
  "estado": "MG",
  "escola": "E.E. Professor José Silva",
  "tipoEscola": 1,
  "serie": "9º Ano",
  "turno": 1,
  "numeroPessoasCasa": 6,
  "contato1": "(31) 98888-7777",
  "contato2": "(31) 3333-4444",
  "anamnese": {
    "possuiEnfermidade": true,
    "observacoesGerais": "Diabetes tipo 1, insulina 3x ao dia",
    "enfermidades": [
      {
        "tipoEnfermidade": 4,
        "descricao": "Diabetes tipo 1 diagnosticado aos 7 anos"
      }
    ]
  }
}
```

### Caso 2: Aluno de Escola Privada sem Enfermidades

```json
{
  "nome": "Ana Clara Rodrigues",
  "dataNascimento": "2013-02-14T00:00:00",
  "rg": "78.901.234-5",
  "cpf": "789.012.345-67",
  "endereco": "Rua dos Pinheiros",
  "numeroEndereco": "1500",
  "bairro": "Pinheiros",
  "municipio": "São Paulo",
  "estado": "SP",
  "escola": "Colégio São José",
  "tipoEscola": 2,
  "serie": "3º Ano",
  "turno": 4,
  "numeroPessoasCasa": 4,
  "contato1": "(11) 97777-6666",
  "anamnese": {
    "possuiEnfermidade": false,
    "observacoesGerais": "Nenhuma restrição médica"
  }
}
```

### Caso 3: Aluno com Múltiplas Enfermidades

```json
{
  "nome": "Rafael Santos Lima",
  "dataNascimento": "2011-07-22T00:00:00",
  "rg": "11.222.333-4",
  "cpf": "112.223.334-45",
  "endereco": "Av. Atlântica",
  "numeroEndereco": "2000",
  "bairro": "Copacabana",
  "municipio": "Rio de Janeiro",
  "estado": "RJ",
  "escola": "Colégio Estadual Rio Branco",
  "tipoEscola": 1,
  "serie": "6º Ano",
  "turno": 2,
  "numeroPessoasCasa": 5,
  "contato1": "(21) 96666-5555",
  "contato2": "(21) 2555-4444",
  "anamnese": {
    "possuiEnfermidade": true,
    "observacoesGerais": "Requer atenção especial nas atividades físicas",
    "enfermidades": [
      {
        "tipoEnfermidade": 1,
        "descricao": "Asma moderada"
      },
      {
        "tipoEnfermidade": 5,
        "descricao": "Perda auditiva parcial no ouvido direito"
      },
      {
        "tipoEnfermidade": 6,
        "descricao": "Miopia, usa óculos"
      }
    ]
  }
}
```

---

## 🚫 Exemplos de Erros Comuns

### CPF Duplicado

**Request:**

```json
POST /api/alunos
{
  "cpf": "123.456.789-00",
  ...
}
```

**Response (400 Bad Request):**

```json
{
  "message": "CPF já cadastrado"
}
```

### Validação de Campos Obrigatórios

**Request:**

```json
POST /api/alunos
{
  "nome": "Teste"
}
```

**Response (400 Bad Request):**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "DataNascimento": ["Data de nascimento é obrigatória"],
    "RG": ["RG é obrigatório"],
    "CPF": ["CPF é obrigatório"],
    ...
  }
}
```

---

## 💡 Dicas de Uso

1. **CPF único:** Cada aluno deve ter um CPF único no sistema
2. **Estado:** Sempre use a sigla de 2 letras (SP, RJ, MG, etc.)
3. **Anamnese opcional:** Você pode cadastrar um aluno sem anamnese e adicionar depois via PUT
4. **Atualização parcial:** No PUT, envie apenas os campos que deseja alterar
5. **Cascade delete:** Ao deletar um aluno, sua anamnese e enfermidades são deletadas automaticamente
