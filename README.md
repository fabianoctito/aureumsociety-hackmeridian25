# Aurum Society - Guia de Instalação e Execução

## Índice
- [Backend (API Python)](#backend-api-python)
- [Frontend (Next.js)](#frontend-nextjs)
- [Requisitos](#requisitos)
- [Contato](#contato)

---

## Backend (API Python)

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
Acesse: http://localhost:8000/docs para ver a documentação da API.

---

## Frontend (Next.js)

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm/yarn)

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
Acesse: http://localhost:3000

---

## Requisitos
- Windows, Linux ou MacOS
- Acesso à internet para baixar dependências

## Contato
Dúvidas ou sugestões? Abra uma issue ou entre em contato com o time Aurum Society.