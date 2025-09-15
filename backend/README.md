# 🌟 Aurum Society - Marketplace de Relógios de Luxo com NFT

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Stellar](https://img.shields.io/badge/Stellar-7D00FF?style=for-the-badge&logo=stellar&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**Revolucionando o mercado de relógios de luxo através da blockchain**

[🚀 Demo Live](#-quick-start) • [📚 Documentação](#-api-reference) • [🧪 Testes](#-testing)

</div>

---

## 🎯 **Sobre o Projeto**

**Aurum Society** é um marketplace inovador que combina a tradição dos relógios de luxo com a modernidade da blockchain. Cada relógio é tokenizado como NFT na rede Stellar, garantindo autenticidade, rastreabilidade e segurança nas transações.

### ✨ **Principais Funcionalidades**

- 🔐 **Autenticação JWT** segura para usuários e lojas
- 💎 **Tokenização NFT** de relógios na blockchain Stellar
- 💳 **Pagamentos** via PIX e cartão de crédito
- 🏪 **Sistema de lojas** com comissões automáticas
- 🔍 **Marketplace** com busca e filtros
- 📊 **Dashboard** com histórico de transações
- 🛡️ **Validações** rigorosas de autenticidade

### 🏗️ **Arquitetura Técnica**

```
FastAPI (Backend) → SQLAlchemy (ORM) → SQLite (Database)
        ↓
Stellar Network (Blockchain) → NFT Tokenization → Escrow System
```

---

## 🚀 **Quick Start**

### 📋 **Pré-requisitos**
- Python 3.8+
- pip
- Git

### ⚡ **Instalação Rápida**

```bash
# 1. Clone o repositório
git clone https://github.com/Maicon-MK/integra--o-blockchain.git
cd integra--o-blockchain

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Inicie o servidor
uvicorn app.main:app --reload

# 5. Acesse a documentação
# http://localhost:8000/docs
```

### 🧪 **Teste o MVP Completo**

```bash
python tests/teste_mvp_fluxo_completo.py
```

**Resultado esperado:** ✅ 10/10 testes passando

---

## 🛠️ **Tecnologias Utilizadas**

| Categoria | Tecnologia | Uso |
|-----------|------------|-----|
| **Backend** | FastAPI | API REST de alta performance |
| **Database** | SQLAlchemy + SQLite | ORM e persistência de dados |
| **Blockchain** | Stellar Network | Tokenização NFT e escrow |
| **Autenticação** | JWT + OAuth2 | Segurança e autorização |
| **Validação** | Pydantic | Validação de dados de entrada |
| **Testes** | Custom Test Suite | Testes automatizados E2E |

---

## 📚 **API Reference**

### 🔐 **Autenticação**
```http
POST /auth/register     # Cadastro de usuário/loja
POST /auth/login        # Login e geração de token JWT
GET  /auth/profile      # Perfil e saldo do usuário
```

### 💎 **Marketplace de Relógios**
```http
POST /watches/                    # Cadastrar relógio (loja)
GET  /watches/marketplace         # Listar relógios à venda
POST /watches/{id}/purchase       # Comprar relógio
GET  /watches/my                  # Meus relógios (com NFT)
```

### 🌌 **Blockchain Stellar**
```http
POST /stellar/register-watch      # Tokenizar relógio como NFT
GET  /stellar/nft-history/{id}    # Histórico de transferências
POST /stellar/transfer-nft        # Transferir propriedade
```

---

## 🎮 **Demo Flow Completo**

1. **🏪 Loja se cadastra** → Cria conta automática na Stellar
2. **💎 Loja cadastra relógio** → Produto fica disponível no marketplace
3. **👤 Usuário se cadastra** → Cria carteira Stellar automaticamente
4. **💳 Usuário compra relógio** → Pagamento via PIX/cartão
5. **🎯 Sistema tokeniza NFT** → Relógio vira token na blockchain
6. **📊 Rastreamento completo** → Histórico imutável de propriedade

---

## 🧪 **Testing**

### 📝 **Suíte de Testes Disponível**

```bash
# Teste principal (MVP completo)
python tests/teste_mvp_fluxo_completo.py

# Testes de segurança
python tests/teste_seguranca.py

# Testes de funcionalidades avançadas
python tests/teste_funcionalidades.py
```

### 📊 **Coverage Atual**
- ✅ **Autenticação:** 100% testado
- ✅ **CRUD Relógios:** 100% testado
- ✅ **Sistema de Pagamentos:** 100% testado
- ✅ **Validações:** 100% testado
- ✅ **Fluxo E2E:** 100% testado

---

## 🚀 **Deploy & Produção**

### 🐳 **Docker** (Opcional)
```bash
docker build -t aurumsociety .
docker run -p 8000:8000 aurumsociety
```

### ☁️ **Variáveis de Ambiente**
```env
JWT_SECRET=your-secret-key
STELLAR_NETWORK=testnet
DATABASE_URL=sqlite:///./marketplace.db
ADMIN_FEE_RATE=0.03
```

---

## 🏆 **Diferenciais Competitivos**

- 🌟 **Blockchain Real:** Integração nativa com Stellar
- 🛡️ **Segurança Robusta:** JWT + validações rigorosas
- ⚡ **Performance:** FastAPI de alta velocidade
- 🧪 **Testado:** 10/10 testes passando
- 📖 **Documentado:** API autodocumentada
- 🎯 **MVP Funcional:** Fluxo completo end-to-end

---

## 👥 **Contribuição**

```bash
# Fork o projeto
# Crie uma branch: git checkout -b feature/nova-funcionalidade
# Commit: git commit -m "feat: adiciona nova funcionalidade"
# Push: git push origin feature/nova-funcionalidade
# Abra um Pull Request
```

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Desenvolvido com ❤️ para revolucionar o mercado de relógios de luxo**

[🌟 Star no GitHub](../../stargazers) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>
