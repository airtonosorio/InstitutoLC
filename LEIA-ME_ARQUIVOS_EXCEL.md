# Arquivos Excel para Teste de Importação

Este diretório contém arquivos Excel de exemplo para testar a funcionalidade de importação de alunos.

## Arquivos Disponíveis

### 1. `exemplo_importacao_alunos.xlsx`
**Arquivo com dados VÁLIDOS** - Todos os registros devem ser importados com sucesso.

- **Total de alunos**: 10
- **Status**: Todos os dados estão corretos
- **Resultado esperado**: ✅ Todos os 10 alunos devem ser importados com sucesso

**Use este arquivo para:**
- Testar a importação bem-sucedida
- Verificar se todos os dados são salvos corretamente
- Validar a funcionalidade básica de importação

### 2. `exemplo_importacao_com_erros.xlsx`
**Arquivo com erros PROPOSITAIS** - Nenhum aluno deve ser importado (validação atômica).

- **Total de linhas**: 9 (incluindo cabeçalho)
- **Linhas com dados**: 8
- **Linhas com erro**: 7 (linhas 3, 5, 6, 7, 8, 9, 10)
- **Resultado esperado**: ❌ Nenhum aluno deve ser importado (importação atômica)

**Erros propositais incluídos:**
- **Linha 3**: Nome vazio (campo obrigatório)
- **Linha 5**: Data inválida (32/13/2012 - data inexistente)
- **Linha 6**: CPF vazio (campo obrigatório)
- **Linha 7**: Estado com mais de 2 caracteres (DFA ao invés de DF)
- **Linha 8**: Tipo de escola inválido ("Particular" ao invés de "Privada")
- **Linha 9**: Turno inválido ("Diurno" ao invés de valores válidos)
- **Linha 10**: Número de pessoas inválido (0 - deve ser >= 1)

**Use este arquivo para:**
- Testar a validação atômica (tudo ou nada)
- Verificar se os erros são detectados corretamente
- Validar que nenhum aluno é importado quando há erros

## Como Usar

1. Acesse a página de **Importar Excel** (`import.html`)
2. Clique no botão **"Importar Excel"**
3. Selecione um dos arquivos de exemplo
4. Aguarde o processamento
5. Visualize o resultado:
   - **Arquivo válido**: Deve mostrar sucesso com todos os alunos importados
   - **Arquivo com erros**: Deve mostrar uma lista de erros e nenhum aluno importado

## Estrutura dos Arquivos

Ambos os arquivos seguem a mesma estrutura de colunas:

| Coluna | Descrição | Obrigatório | Valores Válidos |
|--------|-----------|-------------|-----------------|
| Nome | Nome completo do aluno | Sim | Texto não vazio |
| Data de Nascimento | Data de nascimento | Sim | Formato dd/mm/aaaa |
| RG | Número do RG | Não | Texto |
| CPF | CPF do aluno | Sim | Formato XXX.XXX.XXX-XX ou apenas números |
| Endereço | Endereço completo | Não | Texto |
| Número | Número do endereço | Não | Texto |
| Bairro | Bairro | Não | Texto |
| Município | Município | Não | Texto |
| Estado | Estado (UF) | Sim | 2 letras (ex: SP, RJ, MG) |
| Escola | Nome da escola | Não | Texto |
| Tipo Escola | Tipo de escola | Sim | "Pública" ou "Privada" |
| Série | Série do aluno | Não | Texto |
| Turno | Turno | Sim | "Matutino", "Vespertino", "Noturno" ou "Integral" |
| Número de Pessoas na Casa | Quantidade de pessoas | Sim | Número inteiro >= 1 |
| Contato 1 | Telefone principal | Sim | Texto |
| Contato 2 | Telefone secundário | Não | Texto |

## Validação Atômica

⚠️ **IMPORTANTE**: A importação funciona de forma **atômica** (tudo ou nada):
- Se **TODOS** os registros forem válidos → Todos são importados
- Se **QUALQUER** registro tiver erro → Nenhum é importado

Isso garante a integridade dos dados e evita importações parciais.

## Gerar Novos Arquivos

Se precisar gerar novos arquivos de teste, execute:

```bash
# Arquivo com dados válidos
python gerar_excel_teste.py

# Arquivo com erros propositais
python gerar_excel_com_erros.py
```

## Observações

- Os CPFs nos arquivos de exemplo são fictícios e gerados aleatoriamente
- As datas de nascimento são calculadas para alunos entre 6 e 18 anos
- Os telefones seguem o formato brasileiro: (XX) XXXXX-XXXX
- Os arquivos estão formatados com cabeçalhos destacados e colunas ajustadas

