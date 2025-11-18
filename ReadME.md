# 🌎 GEO ADMIN: Guia de Instalação e Execução

Este projeto é uma aplicação full-stack para administração de dados geográficos (continentes, países e cidades), construída como um **monorepo** com um backend Node.js (Express/Prisma) e um frontend React (Vite).

-----

## 🛠️ Pré-requisitos

Para rodar o projeto, você precisa ter instalado na sua máquina:

1.  **Node.js** (versão 18 ou superior).
2.  **npm** (ou Yarn/pnpm) como gerenciador de pacotes.
3.  Um **Servidor MySQL** rodando (localmente ou acessível).

-----

## ⚙️ Configuração Inicial (Passo a Passo)

Siga os passos abaixo para preparar e executar o projeto.

### 1\. Clonar o Repositório e Instalar Dependências

1.  **Clone o repositório e navegue até a pasta raiz:**

    ```bash
    git clone https://github.com/borroniff/geo-admin
    cd geo-admin
    ```

2.  **Instale as dependências:**
    O projeto usa workspaces. O comando `npm install` na raiz instalará as dependências para o `backend` e `frontend`.

    ```bash
    npm install
    ```

### 2\. Configurar o Banco de Dados (MySQL/Prisma)

O backend utiliza **Prisma** e **MySQL** para persistência dos dados.

1.  **Crie o Arquivo `.env`:**
    Na pasta **`backend/`**, crie um arquivo chamado **`.env`** e insira a string de conexão do seu banco de dados MySQL. Use o arquivo de exemplo como referência.

    **Conteúdo de `backend/.env`:**

    ```dotenv
    DATABASE_URL="mysql://usuario:senha@localhost:3306/geografia_db"
    PORT=3000
    ```

    ⚠️ **Importante:** O banco de dados (`geografia_db` no exemplo) deve ser **criado** no seu servidor MySQL antes de prosseguir.

2.  **Execute as Migrações do Prisma:**
    Este comando aplica o schema do banco de dados e cria as tabelas necessárias (`Continent`, `Country`, `City`).

    ```bash
    # Execute a partir da raiz do projeto
    npm run prisma -- migrate dev --name initial_schema
    ```

-----

## 🚀 Execução do Projeto

O script `dev` na raiz do projeto é configurado para iniciar o backend e o frontend simultaneamente.

1.  **Inicie a Aplicação:**

    Execute estes comandos na pasta **raís** do projeto:

    ```bash
    npm run dev:backend
    npm run dev:frontend
    ```

      * O **Backend** rodará em: `http://localhost:3000`.
      * O **Frontend** rodará em: `http://localhost:5173`.

2.  **Acesse o Dashboard:**

    Abra o link no seu navegador para acessar a aplicação:

    🔗 **[http://localhost:5173/](https://www.google.com/search?q=http://localhost:5173/)**
