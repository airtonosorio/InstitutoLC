# Guia de Importação de Excel

## Como usar a funcionalidade de importação

### 1. Preparar o arquivo Excel

O arquivo Excel deve conter as seguintes colunas na primeira linha (cabeçalho):

- **Nome** - Nome completo do aluno (obrigatório)
- **Data de Nascimento** - Data no formato dd/mm/aaaa (obrigatório)
- **RG** - Número do RG
- **CPF** - CPF do aluno (obrigatório, será limpo automaticamente)
- **Endereço** - Endereço completo
- **Número** - Número do endereço
- **Bairro** - Bairro
- **Município** - Município
- **Estado** - Estado com 2 letras, ex: SP, RJ, MG (obrigatório)
- **Escola** - Nome da escola
- **Tipo Escola** - "Pública" ou "Privada" (obrigatório)
- **Série** - Série do aluno
- **Turno** - "Matutino", "Vespertino", "Noturno" ou "Integral" (obrigatório)
- **Número de Pessoas na Casa** - Número inteiro (obrigatório)
- **Contato 1** - Telefone de contato (obrigatório)
- **Contato 2** - Telefone de contato (opcional)

### 2. Acessar a funcionalidade

1. Acesse a página de Configurações
2. Clique no botão "Importar Excel"
3. Selecione o arquivo Excel (.xlsx ou .xls)
4. Aguarde o processamento

### 3. Visualizar resultados

Após a importação, você verá:
- Total de alunos importados com sucesso
- Lista de erros (se houver)
- Detalhes de cada aluno importado

### 4. Validações realizadas

O sistema valida:
- Campos obrigatórios preenchidos
- Formato de data válido
- CPF único (não duplicado)
- Estado com 2 caracteres
- Tipo de escola válido (Pública/Privada)
- Turno válido (Matutino/Vespertino/Noturno/Integral)
- Número de pessoas na casa válido

### Exemplo de estrutura do Excel

| Nome | Data de Nascimento | RG | CPF | Endereço | Número | Bairro | Município | Estado | Escola | Tipo Escola | Série | Turno | Número de Pessoas na Casa | Contato 1 | Contato 2 |
|------|-------------------|----|----|----------|--------|--------|-----------|--------|--------|--------------|-------|-------|---------------------------|-----------|------------|
| João Silva | 15/03/2010 | 123456789 | 123.456.789-00 | Rua das Flores | 123 | Centro | São Paulo | SP | Escola Municipal | Pública | 5º Ano | Matutino | 4 | (11) 98765-4321 | (11) 91234-5678 |

