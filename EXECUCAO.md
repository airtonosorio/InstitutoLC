# Guia de Execução do Sistema Instituto LC

Este guia explica como executar o sistema de gestão do Instituto LC de duas formas diferentes: **Localmente (em modo de desenvolvimento)** ou **Via Docker (em modo de produção/contêiner)**.

---

## 1. Execução Local (Modo de Desenvolvimento)

Neste modo, você vai rodar o backend (.NET) e o frontend (React/Vite) separadamente. É o modo recomendado para quando você for fazer alterações no código e quiser ver as mudanças em tempo real.

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (versão 18+ recomendada)
*   [.NET 8 SDK](https://dotnet.microsoft.com/pt-br/download/dotnet/8.0) instalado
*   SQL Server local rodando (caso não esteja usando as connection strings do docker, verifique o `appsettings.json`)

### Passo 1: Executando o Backend (.NET 8)
1. Abra um terminal na pasta raiz do backend:
   ```bash
   cd InstitutoLC.Api
   ```
2. Restaure os pacotes e rode o projeto:
   ```bash
   dotnet restore
   dotnet run
   ```
   *A API ficará disponível (geralmente em `http://localhost:5200` ou `https://localhost:7100` dependendo das suas configurações).*

### Passo 2: Executando o Frontend (React)
1. Abra **outro** terminal na pasta do frontend:
   ```bash
   cd InstitutoLC.Api/Views/frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O frontend ficará disponível em `http://localhost:5173`. Você pode acessá-lo no navegador e ele se conectará automaticamente à API.*

---

## 2. Execução via Docker (Modo Produção)

Neste modo, tanto o banco de dados SQL Server, quanto a API (.NET) e o Frontend já compilado rodam dentro de contêineres Docker isolados, configurados de forma automática. 

### Pré-requisitos
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando na sua máquina.

### Como Executar

1. Abra um terminal na pasta `InstitutoLC.Api` (onde o arquivo `docker-compose.yml` está localizado):
   ```bash
   cd InstitutoLC.Api
   ```
2. Execute o comando para construir as imagens e subir os contêineres:
   ```bash
   docker-compose up -d --build
   ```
3. Aguarde alguns segundos enquanto os contêineres são criados e o banco de dados é iniciado. O Entity Framework aplicará as *migrations* e criará o banco automaticamente.

### Como Acessar
Com os contêineres rodando, acesse no seu navegador:
**[http://localhost:8080/](http://localhost:8080/)**

*Nota: Neste modo, o frontend é compilado (via `npm run build`) e os arquivos finais são copiados para a pasta `Views` do backend. O ASP.NET serve os arquivos estáticos diretamente e expõe tudo na porta 8080.*

---

## Dicas Úteis

*   **Para parar os contêineres Docker:** 
    ```bash
    docker-compose down
    ```
*   **Para compilar o frontend para o backend manualmente (sem Docker):** 
    Se você quiser rodar só o `dotnet run` mas quer que ele mostre o frontend atualizado:
    1. Entre na pasta `InstitutoLC.Api/Views/frontend` e rode `npm run build`.
       *(O Vite está configurado em `vite.config.js` para compilar e copiar automaticamente os arquivos de produção direto para a pasta `InstitutoLC.Api/Views`).*
