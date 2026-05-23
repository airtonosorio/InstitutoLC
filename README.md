# Sistema de Gestão - Instituto Lucimário Caitano (Instituto LC)

Este repositório contém o sistema completo de gestão de alunos, turmas e matrículas para o **Instituto Lucimário Caitano**. A plataforma foi desenvolvida focando em responsividade, usabilidade e conformidade com as diretrizes da Lei Geral de Proteção de Dados (LGPD) e as melhores práticas do OWASP Top 10.

---

## 🚀 Arquitetura e Tecnologias

A aplicação é dividida em duas camadas principais integradas em um ambiente de produção unificado:

*   **Backend**: 
    *   **Tecnologia**: ASP.NET Core 8 Web API
    *   **Banco de Dados**: SQL Server (gerido por Entity Framework Core com Migrations)
    *   **Segurança**: Autenticação via Cookies JWT, Criptografia AES-256 e Rate Limiting nativo
*   **Frontend**: 
    *   **Tecnologia**: React, Vite e React Router
    *   **Estilização**: CSS Vanilla com temas adaptados (Glassmorphism e Micro-animações)
    *   **Gráficos**: Chart.js com React Chartjs 2
    *   **Manipulação de Arquivos**: XLSX (SheetJS) para importação e exportação de planilhas

---

## 🔒 Funcionalidades de Segurança e Conformidade (LGPD)

O sistema foi blindado para garantir a proteção de dados pessoais sensíveis (PII):

1.  **Criptografia em Repouso**: Dados sensíveis como CPF, RG e históricos médicos (Anamnese) são criptografados de forma determinística na base de dados utilizando o algoritmo **AES-256-CBC**. Isso impede o acesso a dados pessoais mesmo se o banco for comprometido, preservando a capacidade de consultas indexadas por CPF.
2.  **Autenticação Robusta**: Os tokens de sessão JWT são gravados exclusivamente em cookies **HttpOnly**, com marcações **Secure** e **SameSite=Strict**, neutralizando vulnerabilidades do tipo XSS (Cross-Site Scripting).
3.  **Controle de Taxa (Rate Limiting)**: Proteção ativa contra ataques de força bruta no endpoint de login e exaustão de recursos no upload de planilhas.
4.  **Validações Sanitizadas**: O sistema bloqueia tentativas de upload de planilhas excessivamente grandes (limite de 5MB, máximo de 1000 linhas e 50 colunas) para mitigar negação de serviço (DoS).

---

## 🖥️ Telas de Navegação

A navegação no sistema é feita por meio de uma barra lateral dinâmica que dá acesso às seguintes seções:

### 1. Login
*   **Finalidade**: Ponto de entrada seguro do sistema.
*   **Comportamento**: Valida as credenciais administrativas armazenadas na tabela de usuários de forma segura. Em caso de sucesso, estabelece a sessão e redireciona ao painel administrativo.

### 2. Dashboard
*   **Finalidade**: Apresentar visões estatísticas consolidadas das matrículas da instituição.
*   **Comportamento**: Exibe gráficos dinâmicos de barras e linhas que mostram a quantidade de alunos matriculados ao longo do tempo. É possível filtrar as estatísticas de forma flexível:
    *   **Anual**: Visão distribuída por meses do ano selecionado.
    *   **Mensal**: Detalhamento diário (1 a 31) de um mês específico.
    *   **Semanal**: Agrupamento por dias da semana atual (segunda a domingo).

### 3. Cadastro
*   **Finalidade**: Formulário de registro de novos alunos.
*   **Comportamento**: Captura mais de 30 informações essenciais divididas em blocos:
    *   *Dados Pessoais e Familiares*: Nome, nascimento, gênero, cor/etnia, CPF, RG, filiação e dados socioeconômicos.
    *   *Contatos & Endereço*: Máscaras de telefone em tempo real, CEP e moradia (zona rural/urbana).
    *   *Dados Escolares*: Escola de origem, série e turno escolar do contraturno.
    *   *Histórico de Saúde (Anamnese)*: Questionário rápido sobre condições como asma, alergias, diabetes, uso de medicamentos e cirurgias.
    *   *Atividades*: Permite selecionar uma Atividade Principal e uma Secundária, listadas dinamicamente com base nas opções disponíveis e na faixa etária correspondente à data de nascimento inserida.

### 4. Consulta
*   **Finalidade**: Pesquisa, visualização detalhada e edição de registros.
*   **Comportamento**:
    *   Exibe uma tabela contendo todos os alunos cadastrados com status visual rápido de enturmação (*Enturmado* ou *Em Espera*).
    *   Fornece filtros de pesquisa inteligente por Nome, CPF, faixa etária e período de cadastro.
    *   **Visualizar Detalhes**: Abre um modal estendido com todas as informações coletadas no cadastro divididas em abas/seções estéticas.
    *   **Editar Aluno**: Abre um formulário de edição com os dados pré-preenchidos, permitindo atualizar o cadastro mantendo o cálculo dinâmico de atividades por idade.
    *   **Excluir**: Permite remover cadastros com confirmação.

### 5. Gerenciamento de Turmas
*   **Finalidade**: Controlar a criação, alteração e alocação de alunos em turmas ativas.
*   **Comportamento**:
    *   **Criador/Editor de Turma**: Formulário em grid para criar e atualizar turmas indicando nome, limite de alunos, atividade esportiva/cultural associada, horários e período letivo.
    *   **Fluxo de Enturmação (Modal de Detalhes da Turma)**:
        *   *Coluna de Candidatos (Esquerda)*: Lista alunos elegíveis em lista de espera (que escolheram aquela atividade e possuem idade adequada, mas que ainda não estão enturmados).
        *   *Coluna de Matriculados (Direita)*: Lista os alunos já enturmados.
        *   *Movimentação Inteligente*: Clicar no aluno o transfere de coluna automaticamente (respeitando o limite de vagas da turma). As modificações são salvas em lote.
    *   **Switch de Status**: Permite ativar ou inativar turmas com transições animadas.

### 6. Configurações do Usuário
*   **Finalidade**: Gerenciar a segurança administrativa e as atividades oferecidas pela instituição.
*   **Comportamento**:
    *   **Alterar Nome de Usuário**: Atualiza o usuário de acesso à plataforma, gerando um novo token de cookie dinamicamente para manter o administrador conectado.
    *   **Alterar Senha**: Atualiza a senha administrativa aplicando criptografia (hash) segura.
    *   **Gerenciamento de Atividades**: Painel administrativo para criar ou remover atividades do banco de dados (ex: Futebol de campo, Futsal, Ballet, Creche). Cada atividade possui suas regras de idade mínima e máxima que controlam os dropdowns de seleção nas demais telas.

### 7. Exportação/ Importação
*   **Finalidade**: Interface para cargas e backups de dados.
*   **Comportamento**:
    *   **Importação**: Permite arrastar ou selecionar uma planilha Excel (`.xlsx`/`.xls`) para cadastrar alunos em massa, validando dados obrigatórios em tempo real.
    *   **Exportação**: Permite filtrar os alunos cadastrados por Atividade, faixa etária e data de cadastro antes de gerar o download de uma planilha Excel higienizada e formatada.

---

## 🛠️ Como Executar a Aplicação

A aplicação pode ser executada de duas maneiras: **Localmente (Modo Desenvolvimento)** ou **Via Docker (Modo Produção)**.

### 1. Execução Local (Modo Desenvolvimento)

Neste modo, você executa o backend (.NET) e o frontend (React/Vite) separadamente. Recomendado para desenvolvimento ativo com Hot Reloading.

#### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (versão 18+)
*   [.NET 8 SDK](https://dotnet.microsoft.com/pt-br/download/dotnet/8.0) instalado
*   SQL Server rodando na sua máquina

#### Passo 1: Executando o Backend
1. Abra o terminal na pasta do backend:
   ```bash
   cd InstitutoLC.Api
   ```
2. Restaure as dependências e inicie o projeto:
   ```bash
   dotnet restore
   dotnet run
   ```
   *O backend estará acessível em `http://localhost:5200` ou `https://localhost:7100`.*

#### Passo 2: Executando o Frontend
1. Abra um novo terminal na pasta do frontend:
   ```bash
   cd InstitutoLC.Api/Views/frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O frontend estará disponível em `http://localhost:5173`.*

---

### 2. Execução via Docker (Modo Produção)

Neste modo, o banco de dados SQL Server, a API (.NET) e o Frontend (já compilado e servido de forma otimizada) rodam em contêineres Docker isolados.

#### Pré-requisitos
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) rodando na máquina

#### Passo a Passo
1. Abra o terminal na pasta raiz da API (onde está o arquivo `docker-compose.yml`):
   ```bash
   cd InstitutoLC.Api
   ```
2. Suba o ambiente com o comando de compilação:
   ```bash
   docker-compose up -d --build
   ```
3. Aguarde o Docker construir a imagem e subir os contêineres. As migrações do banco e a inserção dos dados padrão serão processadas automaticamente na inicialização.
4. Acesse a aplicação no navegador em:
   **[http://localhost:8080/](http://localhost:8080/)**

Para parar o ambiente docker, utilize o comando:
```bash
docker-compose down
```

