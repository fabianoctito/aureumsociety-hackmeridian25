# Esquema de Banco de Dados - LuxTime Watch E-commerce

## Visão Geral
Este documento apresenta a estrutura de banco de dados para o projeto LuxTime, um e-commerce de relógios de luxo com funcionalidades de marketplace, coleção pessoal, autenticação, pagamentos em criptomoeda e sistema de transações.

## Principais Entidades Identificadas

### 1. **USERS** - Tabela de Usuários
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    user_type ENUM('client', 'store') DEFAULT 'client',
    balance DECIMAL(15,2) DEFAULT 0.00,
    store_name VARCHAR(255), -- Apenas para tipo 'store'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP
);
```

### 2. **BRANDS** - Marcas de Relógios
```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    country_origin VARCHAR(100),
    founded_year INTEGER,
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **CATEGORIES** - Categorias de Relógios
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. **WATCHES** - Catálogo Principal de Relógios
```sql
CREATE TABLE watches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    brand_id UUID REFERENCES brands(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    specifications JSONB, -- JSON para especificações técnicas
    base_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_limited_edition BOOLEAN DEFAULT FALSE,
    production_year INTEGER,
    case_material VARCHAR(100),
    movement_type VARCHAR(100),
    water_resistance VARCHAR(50),
    dial_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 5. **WATCH_IMAGES** - Imagens dos Relógios
```sql
CREATE TABLE watch_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watch_id UUID REFERENCES watches(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    image_type ENUM('main', 'gallery', 'detail', 'back', 'side') DEFAULT 'gallery',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. **USER_WATCHES** - Coleção Pessoal de Relógios dos Usuários
```sql
CREATE TABLE user_watches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    watch_id UUID REFERENCES watches(id),
    custom_name VARCHAR(255), -- Nome personalizado pelo usuário
    custom_brand VARCHAR(255), -- Para relógios não catalogados
    purchase_price DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2),
    purchase_date DATE NOT NULL,
    purchase_location VARCHAR(255),
    serial_number VARCHAR(255),
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    status ENUM('owned', 'for_sale', 'sold') DEFAULT 'owned',
    sale_price DECIMAL(12,2), -- Preço de venda quando status = 'for_sale'
    sale_date DATE, -- Data da venda quando status = 'sold'
    notes TEXT,
    images JSONB, -- Array de URLs de imagens personalizadas
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. **MARKETPLACE_LISTINGS** - Anúncios no Marketplace
```sql
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) NOT NULL,
    user_watch_id UUID REFERENCES user_watches(id),
    watch_id UUID REFERENCES watches(id), -- Para lojas que vendem novos
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    crypto_prices JSONB, -- {btc: 0.285, eth: 4.2, usdc: 12500}
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    is_authenticated BOOLEAN DEFAULT FALSE,
    authentication_cert_url VARCHAR(500),
    shipping_included BOOLEAN DEFAULT TRUE,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    available_quantity INTEGER DEFAULT 1,
    listing_type ENUM('auction', 'fixed_price', 'negotiable') DEFAULT 'fixed_price',
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    status ENUM('active', 'sold', 'removed', 'expired') DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. **ORDERS** - Pedidos/Compras
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) NOT NULL,
    seller_id UUID REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address JSONB NOT NULL, -- JSON com endereço completo
    notes TEXT,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. **ORDER_ITEMS** - Itens dos Pedidos
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id),
    watch_name VARCHAR(255) NOT NULL,
    watch_brand VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. **TRANSACTIONS** - Transações Financeiras
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    order_id UUID REFERENCES orders(id), -- Opcional, quando relacionado a uma compra
    transaction_type ENUM('deposit', 'withdrawal', 'purchase', 'sale', 'refund') NOT NULL,
    amount DECIMAL(15,2) NOT NULL, -- Valor positivo para crédito, negativo para débito
    currency VARCHAR(10) NOT NULL, -- BRL, BTC, ETH, USDC, etc.
    crypto_amount DECIMAL(20,8), -- Quantidade em criptomoeda (precisão alta)
    exchange_rate DECIMAL(15,8), -- Taxa de câmbio no momento da transação
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50), -- PIX, Bitcoin, Ethereum, etc.
    payment_hash VARCHAR(255), -- Hash da transação blockchain
    payment_address VARCHAR(255), -- Endereço da carteira
    description TEXT NOT NULL,
    reference_id VARCHAR(255), -- ID externo de referência
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. **CRYPTO_PAYMENTS** - Pagamentos em Criptomoeda
```sql
CREATE TABLE crypto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    crypto_currency VARCHAR(10) NOT NULL, -- BTC, ETH, USDC
    crypto_amount DECIMAL(20,8) NOT NULL,
    usd_amount DECIMAL(12,2) NOT NULL,
    exchange_rate DECIMAL(15,8) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255) UNIQUE,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    payment_status ENUM('pending', 'confirming', 'confirmed', 'failed', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12. **USER_FAVORITES** - Relógios Favoritos
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    listing_id UUID REFERENCES marketplace_listings(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);
```

### 13. **WATCH_VALUATIONS** - Histórico de Avaliações
```sql
CREATE TABLE watch_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watch_id UUID REFERENCES watches(id) NOT NULL,
    market_value DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    valuation_date DATE NOT NULL,
    source VARCHAR(100), -- 'market_data', 'auction_result', 'dealer_price'
    condition_rating INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14. **USER_SESSIONS** - Sessões de Usuário
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 15. **AUDIT_LOGS** - Logs de Auditoria
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices Recomendados

```sql
-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_watches_brand ON watches(brand_id);
CREATE INDEX idx_watches_category ON watches(category_id);
CREATE INDEX idx_user_watches_user ON user_watches(user_id);
CREATE INDEX idx_user_watches_status ON user_watches(status);
CREATE INDEX idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_crypto_payments_hash ON crypto_payments(transaction_hash);
CREATE INDEX idx_favorites_user ON user_favorites(user_id);

-- Índices compostos
CREATE INDEX idx_marketplace_active ON marketplace_listings(status, created_at) WHERE status = 'active';
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_user_watches_user_status ON user_watches(user_id, status);
```

## Relacionamentos Principais

1. **Users ↔ User_Watches**: Um usuário pode ter múltiplos relógios
2. **Users ↔ Marketplace_Listings**: Um usuário pode criar múltiplos anúncios
3. **Users ↔ Orders**: Um usuário pode fazer múltiplas compras
4. **Users ↔ Transactions**: Um usuário tem múltiplas transações
5. **Watches ↔ User_Watches**: Um modelo de relógio pode estar na coleção de múltiplos usuários
6. **Marketplace_Listings ↔ Orders**: Um anúncio pode gerar múltiplos pedidos
7. **Orders ↔ Crypto_Payments**: Um pedido pode ter um pagamento em cripto

## Triggers e Funções Recomendadas

```sql
-- Função para atualizar saldo do usuário
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE users 
        SET balance = balance + NEW.amount 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo automaticamente
CREATE TRIGGER trigger_update_balance
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balance();

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_watches_modtime BEFORE UPDATE ON watches FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_watches_modtime BEFORE UPDATE ON user_watches FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_marketplace_modtime BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

## Dados de Exemplo (Seeds)

```sql
-- Inserir marcas populares
INSERT INTO brands (name, country_origin, founded_year) VALUES
('Rolex', 'Switzerland', 1905),
('Patek Philippe', 'Switzerland', 1839),
('Audemars Piguet', 'Switzerland', 1875),
('Omega', 'Switzerland', 1848),
('Cartier', 'France', 1847),
('Breitling', 'Switzerland', 1884);

-- Inserir categorias
INSERT INTO categories (name, slug) VALUES
('Sport Watch', 'sport-watch'),
('Dress Watch', 'dress-watch'),
('Diving Watch', 'diving-watch'),
('Chronograph', 'chronograph'),
('Pilot Watch', 'pilot-watch');

-- Inserir relógios populares
INSERT INTO watches (name, model, brand_id, category_id, base_price, description) VALUES
('Submariner Date', '126610LN', (SELECT id FROM brands WHERE name = 'Rolex'), (SELECT id FROM categories WHERE name = 'Diving Watch'), 12500, 'Iconic diving watch with date display'),
('Nautilus', '5711/1A', (SELECT id FROM brands WHERE name = 'Patek Philippe'), (SELECT id FROM categories WHERE name = 'Sport Watch'), 85000, 'Luxury sport watch with integrated bracelet'),
('Royal Oak Offshore', '26470ST', (SELECT id FROM brands WHERE name = 'Audemars Piguet'), (SELECT id FROM categories WHERE name = 'Sport Watch'), 32000, 'Bold chronograph with octagonal bezel');
```

## Considerações de Segurança

1. **Criptografia**: Senhas devem ser hasheadas com bcrypt ou Argon2
2. **Tokens JWT**: Para autenticação de sessão
3. **Rate Limiting**: Para APIs de pagamento e transações
4. **Auditoria**: Logs completos de todas as transações financeiras
5. **Validação**: Validação rigorosa de dados de entrada
6. **Backup**: Backups regulares com criptografia
7. **SSL/TLS**: Todas as comunicações devem ser criptografadas

## Escalabilidade

1. **Particionamento**: Tabela de transações pode ser particionada por data
2. **Índices**: Índices otimizados para consultas frequentes
3. **Cache**: Redis para dados frequentemente acessados
4. **CDN**: Para imagens de relógios
5. **Read Replicas**: Para consultas de leitura pesadas

Esta estrutura suporta todas as funcionalidades identificadas no código e é escalável para um e-commerce de relógios de luxo com pagamentos em criptomoeda.
