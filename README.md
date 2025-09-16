# 🏆 Aurum Society - Plataforma de Colecionáveis de Luxo

![Aurum Society](https://img.shields.io/badge/Aurum%20Society-Rel%C3%B3gios%20de%20Luxo-gold)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)

## 📝 Sobre o Projeto

A Aurum Society é uma plataforma exclusiva para colecionadores de relógios de luxo, que oferece um marketplace seguro para compra, venda e autenticação de peças de alto valor. Nosso sistema integra tecnologias modernas para garantir transparência nas transações e autenticidade dos itens.

### ✨ Principais Funcionalidades
- Autenticação segura de usuários
- Catálogo de relógios de luxo
- Sistema de marketplace para compra e venda
- Gerenciamento de coleção pessoal
- Autenticação e verificação de peças
- Integração com tecnologia blockchain para rastreabilidade

## 📋 Índice
- [Demonstração](#-demonstração)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Backend (API Python)](#-backend-api-python)
- [Frontend (Next.js)](#-frontend-nextjs)
- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Roadmap](#-roadmap)
- [Equipe](#-equipe)
- [Contato](#-contato)
- [Licença](#-licença)

---

## 🎬 Demonstração

*Capturas de tela ou link para demonstração em vídeo estarão disponíveis em breve.*

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework Python de alta performance para APIs
- **SQLite/SQLAlchemy**: Banco de dados e ORM
- **Pydantic**: Validação de dados
- **JWT**: Autenticação segura
- **Stellar SDK**: Integração com blockchain

### Frontend
- **Next.js 14**: Framework React com renderização híbrida
- **TypeScript**: Tipagem estática para JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn UI**: Componentes de UI reutilizáveis
- **React Context API**: Gerenciamento de estado

## 🏗️ Arquitetura

O projeto segue uma arquitetura de microsserviços com:
- **Backend**: API RESTful construída com FastAPI
- **Frontend**: Aplicação SSR/CSR híbrida com Next.js
- **Blockchain**: Integração para certificação e rastreabilidade

---

## 🖥️ Backend (API Python)

### Pré-requisitos
- Python 3.8+
- pip
- Git

### Instalação
1. Abra o terminal e navegue até a pasta `backend`:
   ```powershell
   cd backend
   ```
2. Crie o ambiente virtual:
   ```powershell
   python -m venv .venv
   ```
3. Ative o ambiente virtual:
   ```powershell
   .\.venv\Scripts\Activate
   ```
4. Instale as dependências:
   ```powershell
   pip install -r requirements.txt
   pip install pydantic[email]
   ```
5. (Opcional) Configure variáveis de ambiente:
   - Copie `.env.example` para `.env` e ajuste conforme necessário.

### Execução
```powershell
uvicorn app.main:app --reload
```
Acesse: http://localhost:8000/docs para ver a documentação interativa da API (Swagger UI).

---

## 🎨 Frontend (Next.js)

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm/yarn

### Instalação
1. Abra o terminal e navegue até a pasta `frontend`:
   ```powershell
   cd frontend
   ```
2. Instale as dependências:
   ```powershell
   pnpm install
   # ou
   npm install
   # ou
   yarn install
   ```

### Execução
```powershell
pnpm dev
# ou
npm run dev
# ou
yarn dev
```
Acesse: http://localhost:3000 para visualizar a aplicação.

---

## 💻 Requisitos do Sistema
- Sistema operacional: Windows, Linux ou macOS
- Memória: mínimo 4GB RAM
- Armazenamento: mínimo 1GB livre
- Acesso à internet para baixar dependências
- Navegador moderno (Chrome, Firefox, Safari ou Edge)

## 🚀 Roadmap

- [x] Desenvolvimento da MVP com funcionalidades básicas
- [x] Sistema de autenticação e autorização
- [x] Catálogo de produtos
- [ ] Integração completa com blockchain
- [ ] App mobile (iOS/Android)
- [ ] Integração com APIs de parceiros
- [ ] Marketplace com sistema de leilão

## 👥 Equipe

Projeto desenvolvido pelo time Aurum Society durante o Hack Meridian 2025.

## 📧 Contato

Dúvidas, sugestões ou interesse em colaborar? Entre em contato:

- **GitHub**: Abra uma issue neste repositório
- **Email**: [contato@aurumsociety.com](mailto:contato@aurumsociety.com)

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).