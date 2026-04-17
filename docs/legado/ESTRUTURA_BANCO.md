# Estrutura do Banco de Dados - Instituto LC

## 📊 Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────┐
│                         ALUNOS                              │
├─────────────────────────────────────────────────────────────┤
│ PK  Id                    INT                               │
│     Nome                  NVARCHAR(200)    NOT NULL        │
│     DataNascimento        DATETIME2        NOT NULL        │
│     RG                    NVARCHAR(20)     NOT NULL        │
│ UK  CPF                   NVARCHAR(14)     NOT NULL UNIQUE │
│     Endereco              NVARCHAR(300)    NOT NULL        │
│     NumeroEndereco        NVARCHAR(20)     NOT NULL        │
│     Bairro                NVARCHAR(100)    NOT NULL        │
│     Municipio             NVARCHAR(100)    NOT NULL        │
│     Estado                NVARCHAR(2)      NOT NULL        │
│     Escola                NVARCHAR(200)    NOT NULL        │
│     TipoEscola            INT              NOT NULL        │
│     Serie                 NVARCHAR(50)     NOT NULL        │
│     Turno                 INT              NOT NULL        │
│     NumeroPessoasCasa     INT              NOT NULL        │
│     Contato1              NVARCHAR(20)     NOT NULL        │
│     Contato2              NVARCHAR(20)     NULL            │
│     DataCadastro          DATETIME2        NOT NULL        │
│     DataAtualizacao       DATETIME2        NULL            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ANAMNESES_ALUNOS                         │
├─────────────────────────────────────────────────────────────┤
│ PK  Id                    INT                               │
│ FK  AlunoId               INT              NOT NULL UNIQUE  │
│     PossuiEnfermidade     BIT              NOT NULL        │
│     ObservacoesGerais     NVARCHAR(1000)   NULL            │
│     DataCadastro          DATETIME2        NOT NULL        │
│     DataAtualizacao       DATETIME2        NULL            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      ENFERMIDADES                           │
├─────────────────────────────────────────────────────────────┤
│ PK  Id                    INT                               │
│ FK  AnamneseAlunoId       INT              NOT NULL        │
│     TipoEnfermidade       INT              NOT NULL        │
│     Descricao             NVARCHAR(500)    NULL            │
│     DataCadastro          DATETIME2        NOT NULL        │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Relacionamentos

### 1. Alunos ↔ AnamnesesAlunos (1:1)

- Um aluno pode ter **uma** anamnese
- Uma anamnese pertence a **um** aluno
- **Cascade Delete:** Ao deletar aluno, a anamnese é deletada

### 2. AnamnesesAlunos ↔ Enfermidades (1:N)

- Uma anamnese pode ter **várias** enfermidades
- Uma enfermidade pertence a **uma** anamnese
- **Cascade Delete:** Ao deletar anamnese, as enfermidades são deletadas

## 📋 Tabelas Detalhadas

### Tabela: Alunos

| Campo             | Tipo      | Tamanho | Obrigatório | Descrição                                       |
| ----------------- | --------- | ------- | ----------- | ----------------------------------------------- |
| Id                | INT       | -       | Sim (PK)    | Identificador único                             |
| Nome              | NVARCHAR  | 200     | Sim         | Nome completo do aluno                          |
| DataNascimento    | DATETIME2 | -       | Sim         | Data de nascimento                              |
| RG                | NVARCHAR  | 20      | Sim         | Registro Geral                                  |
| CPF               | NVARCHAR  | 14      | Sim (Único) | Cadastro de Pessoa Física                       |
| Endereco          | NVARCHAR  | 300     | Sim         | Logradouro                                      |
| NumeroEndereco    | NVARCHAR  | 20      | Sim         | Número da residência                            |
| Bairro            | NVARCHAR  | 100     | Sim         | Bairro                                          |
| Municipio         | NVARCHAR  | 100     | Sim         | Cidade                                          |
| Estado            | NVARCHAR  | 2       | Sim         | Sigla do estado (UF)                            |
| Escola            | NVARCHAR  | 200     | Sim         | Nome da escola                                  |
| TipoEscola        | INT       | -       | Sim         | 1=Pública, 2=Privada                            |
| Serie             | NVARCHAR  | 50      | Sim         | Série/Ano escolar                               |
| Turno             | INT       | -       | Sim         | 1=Matutino, 2=Vespertino, 3=Noturno, 4=Integral |
| NumeroPessoasCasa | INT       | -       | Sim         | Quantidade de moradores                         |
| Contato1          | NVARCHAR  | 20      | Sim         | Telefone principal                              |
| Contato2          | NVARCHAR  | 20      | Não         | Telefone secundário                             |
| DataCadastro      | DATETIME2 | -       | Sim         | Data de criação do registro                     |
| DataAtualizacao   | DATETIME2 | -       | Não         | Data da última atualização                      |

**Índices:**

- PRIMARY KEY: Id
- UNIQUE INDEX: CPF

---

### Tabela: AnamnesesAlunos

| Campo             | Tipo      | Tamanho | Obrigatório | Descrição                           |
| ----------------- | --------- | ------- | ----------- | ----------------------------------- |
| Id                | INT       | -       | Sim (PK)    | Identificador único                 |
| AlunoId           | INT       | -       | Sim (FK)    | Referência ao aluno                 |
| PossuiEnfermidade | BIT       | -       | Sim         | Indica se possui alguma enfermidade |
| ObservacoesGerais | NVARCHAR  | 1000    | Não         | Observações médicas adicionais      |
| DataCadastro      | DATETIME2 | -       | Sim         | Data de criação do registro         |
| DataAtualizacao   | DATETIME2 | -       | Não         | Data da última atualização          |

**Índices:**

- PRIMARY KEY: Id
- UNIQUE INDEX: AlunoId (garante relação 1:1)
- FOREIGN KEY: AlunoId → Alunos.Id (CASCADE DELETE)

---

### Tabela: Enfermidades

| Campo           | Tipo      | Tamanho | Obrigatório | Descrição                   |
| --------------- | --------- | ------- | ----------- | --------------------------- |
| Id              | INT       | -       | Sim (PK)    | Identificador único         |
| AnamneseAlunoId | INT       | -       | Sim (FK)    | Referência à anamnese       |
| TipoEnfermidade | INT       | -       | Sim         | Tipo da enfermidade (enum)  |
| Descricao       | NVARCHAR  | 500     | Não         | Descrição detalhada         |
| DataCadastro    | DATETIME2 | -       | Sim         | Data de criação do registro |

**Índices:**

- PRIMARY KEY: Id
- INDEX: AnamneseAlunoId
- FOREIGN KEY: AnamneseAlunoId → AnamnesesAlunos.Id (CASCADE DELETE)

---

## 🏥 Enum: TipoEnfermidade

| Valor | Nome                | Descrição                    |
| ----- | ------------------- | ---------------------------- |
| 1     | BronquiteAsma       | Problemas respiratórios      |
| 2     | DoencaCoracao       | Problemas cardíacos          |
| 3     | EpilepsiaConvulsoes | Distúrbios neurológicos      |
| 4     | Diabetes            | Diabetes tipo 1 ou 2         |
| 5     | ProblemaAuditivo    | Deficiência auditiva         |
| 6     | ProblemaVisual      | Deficiência visual           |
| 7     | DoencaOrtopedica    | Problemas ósseos/articulares |
| 8     | Alergia             | Alergias diversas            |
| 9     | Outros              | Outras condições             |

---

## 🏫 Enum: TipoEscola

| Valor | Nome    | Descrição                           |
| ----- | ------- | ----------------------------------- |
| 1     | Publica | Escola pública (municipal/estadual) |
| 2     | Privada | Escola particular                   |

---

## 📅 Enum: Turno

| Valor | Nome       | Descrição        |
| ----- | ---------- | ---------------- |
| 1     | Matutino   | Manhã            |
| 2     | Vespertino | Tarde            |
| 3     | Noturno    | Noite            |
| 4     | Integral   | Período integral |

---

## 🔒 Regras de Integridade

### Constraints Aplicadas

1. **CPF Único**

   ```sql
   UNIQUE INDEX IX_Alunos_CPF ON Alunos(CPF)
   ```

2. **Relação 1:1 Aluno-Anamnese**

   ```sql
   UNIQUE INDEX IX_AnamnesesAlunos_AlunoId ON AnamnesesAlunos(AlunoId)
   ```

3. **Cascade Delete**
   - Deletar Aluno → Deleta Anamnese → Deleta Enfermidades
4. **Campos Obrigatórios**
   - Todos marcados como `NOT NULL` na estrutura

### Validações na Aplicação

- **CPF:** Máximo 14 caracteres (formato com pontos e traço)
- **Estado:** Exatamente 2 caracteres (sigla UF)
- **NumeroPessoasCasa:** Entre 1 e 50
- **Strings:** Respeitar tamanhos máximos definidos

---

## 📈 Tamanho Estimado

### Estimativa de Armazenamento por Registro

| Tabela          | Tamanho Aproximado |
| --------------- | ------------------ |
| Alunos          | ~1.5 KB            |
| AnamnesesAlunos | ~0.5 KB            |
| Enfermidades    | ~0.3 KB cada       |

### Exemplo: 1000 Alunos

- 1000 alunos × 1.5 KB = **1.5 MB**
- 500 anamneses × 0.5 KB = **0.25 MB**
- 1000 enfermidades × 0.3 KB = **0.3 MB**
- **Total:** ~2 MB (sem contar índices)

---

## 🔍 Queries Úteis

### Listar todos os alunos com anamnese

```sql
SELECT
    a.*,
    an.PossuiEnfermidade,
    an.ObservacoesGerais
FROM Alunos a
LEFT JOIN AnamnesesAlunos an ON a.Id = an.AlunoId;
```

### Alunos com enfermidades específicas

```sql
SELECT
    a.Nome,
    e.TipoEnfermidade,
    e.Descricao
FROM Alunos a
INNER JOIN AnamnesesAlunos an ON a.Id = an.AlunoId
INNER JOIN Enfermidades e ON an.Id = e.AnamneseAlunoId
WHERE e.TipoEnfermidade = 4; -- Diabetes
```

### Estatísticas

```sql
-- Total de alunos por tipo de escola
SELECT
    TipoEscola,
    COUNT(*) as Total
FROM Alunos
GROUP BY TipoEscola;

-- Alunos com e sem enfermidades
SELECT
    CASE WHEN an.PossuiEnfermidade = 1 THEN 'Com Enfermidade' ELSE 'Sem Enfermidade' END as Status,
    COUNT(*) as Total
FROM Alunos a
LEFT JOIN AnamnesesAlunos an ON a.Id = an.AlunoId
GROUP BY an.PossuiEnfermidade;
```
