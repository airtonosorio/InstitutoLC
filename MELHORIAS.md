# Melhorias e Implementações Realizadas

Esta ramificação (`melhorias-gerais`) agrupa uma série de otimizações de interface, correções de bugs, novos fluxos de enturmação, filtros dinâmicos de relatórios e reestruturação do banco de dados/modelos para o projeto **InstitutoLC**.

Abaixo estão detalhadas todas as mudanças e melhorias realizadas:

## 1. Cadastro de Alunos e Edição
- **Máscara de RG Padronizada**: Campo de RG agora valida e aplica máscara em tempo real no formato `99.999.999-9` ou `12.345.678-X` (aceitando dígito X no final).
- **Alinhamento de Layout**:
  - Campo "Responsável" agora possui o mesmo tamanho dos campos de "Nome do Pai" e "Nome da Mãe".
  - Opção "Alguém da Família Recebe Benefício?" foi redimensionada (checkbox maior) e centralizada em sua respectiva div.
- **Seção de Anamnese (Histórico de Saúde)**:
  - Adicionado no formulário de Cadastro e no Modal de Edição um conjunto de checkboxes e campos opcionais para histórico médico:
    - Bronquite/Asma, Doença Cardiovascular, Epilepsia, Convulsões, Diabetes, Problemas Auditivos, Alergia, Problemas Oculares e Problemas Ortopédicos.
    - Campos de texto livre para "Tomando Algum Medicamento?", "Já realizou alguma cirurgia?" e "Outro".
- **Remoção de Turma do Cadastro**: O vínculo com turma foi removido da tela de Cadastro, substituído pela seleção de até duas Atividades (Atividade Principal e Secundária). A enturmação agora é feita na tela de Gerenciamento de Turmas.

## 2. Consulta de Alunos
- **Coluna de Status**: Adicionada a coluna **Status** na tabela principal (entre Data de Criação e Ações). Exibe badge visual verde `Enturmado` ou amarela `Em espera`.
- **Modal de Detalhes**:
  - Redesenhado com layout adaptivo (`large` - 900px) dividido em seções claras: Dados Pessoais/Familiares, Endereço, Dados Escolares, Contatos, Anamnese e Atividades.
- **Modal de Edição Completo**:
  - Reestruturado para incluir todos os mais de 30 campos do formulário de cadastro original.
  - Seleção dinâmica de atividades baseada na idade do aluno (anos e meses) no momento da edição.
  - Botões "Cancelar" e "Salvar Alterações" padronizados e alinhados.

## 3. Gerenciamento de Turmas
- **Remoção do Botão "Gerar Teste"**: Removida a opção desnecessária.
- **Alinhamento do Formulário**: O painel de criação de turmas foi alinhado com o design do formulário de cadastro (adotando glassmorphism, grid responsivo e estilo padrão).
- **Horário de Início e Fim**: Substituída a seleção de horários estáticos por campos nativos de horário (`time`) de início e fim.
- **Toggle de Turma Ativa**: Substituído o checkbox padrão por um Switch/Toggle customizado premium com animações suaves, ativo por padrão na criação.
- **Fluxo Dual de Enturmação (Modal de Detalhes da Turma)**:
  - Ao clicar em uma turma, abre-se um modal estendido de `1000px`.
  - **Coluna da Esquerda (Candidatos)**: Lista alunos candidatos que escolheram a atividade correspondente e atendem à faixa etária da turma, mas que ainda não estão enturmados.
  - **Coluna da Direita (Matriculados)**: Lista alunos já matriculados na turma.
  - **Interação Simples**: Clicar no nome do candidato à esquerda o move para os matriculados (respeitando o limite de vagas); clicar no matriculado o remove da turma.
  - **Salvar em Lote**: Botão para salvar as alterações em lote que atualiza o banco de dados e as flags de status dos alunos imediatamente.
- **Botão de Excluir Turma**: Estilizado com formato circular perfeito (`border-radius: 9999px`), sem bordas extras e com hover suave.

## 4. Dashboard e Filtros de Gráfico
- **Filtros Dinâmicos de Matrícula**:
  - **Ano**: Agrupa e exibe matrículas por meses do ano selecionado (ano atual + anos anteriores com dados).
  - **Mensal**: Permite escolher mês e ano específicos, plotando dados de matrículas divididos pelos dias do mês (1 a 31).
  - **Semanal**: Mostra a semana atual por padrão (ou período customizado), agrupando dados de segunda a domingo.

## 5. Estrutura e Guias
- **Exclusão de Horários**: A página/fluxo desnecessário de Horários foi inteiramente excluído (rotas, componentes e estilos).
- **Compilação Automática (Vite)**: O arquivo `vite.config.js` foi configurado para compilar os assets do frontend diretamente dentro da pasta `Views` do backend ASP.NET (`InstitutoLC.Api/Views`), otimizando o fluxo de build no Docker.
- **Guias de Execução Atualizados**: Os arquivos `EXECUCAO.md` e `GUIA_EXECUCAO.md` foram revisados com instruções claras sobre como iniciar o ambiente frontend (`npm install` / `npm run dev`) e executar o build final de produção.
