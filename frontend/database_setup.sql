-- =====================================================
-- LUXTIME WATCH E-COMMERCE DATABASE SETUP
-- =====================================================
-- Created: September 4, 2025
-- Database: PostgreSQL
-- Description: Complete database schema for luxury watch e-commerce platform
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User types
CREATE TYPE user_type_enum AS ENUM ('client', 'store');

-- Watch status for user collection
CREATE TYPE watch_status_enum AS ENUM ('owned', 'for_sale', 'sold');

-- Order status
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Payment status
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Transaction types
CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdrawal', 'purchase', 'sale', 'refund');

-- Transaction status
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Listing types
CREATE TYPE listing_type_enum AS ENUM ('auction', 'fixed_price', 'negotiable');

-- Listing status
CREATE TYPE listing_status_enum AS ENUM ('active', 'sold', 'removed', 'expired');

-- Image types
CREATE TYPE image_type_enum AS ENUM ('main', 'gallery', 'detail', 'back', 'side');

-- Crypto payment status
CREATE TYPE crypto_payment_status_enum AS ENUM ('pending', 'confirming', 'confirmed', 'failed', 'expired');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    user_type user_type_enum DEFAULT 'client',
    balance DECIMAL(15,2) DEFAULT 0.00,
    store_name VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT store_name_required CHECK (
        (user_type = 'store' AND store_name IS NOT NULL) OR 
        (user_type = 'client')
    )
);

-- BRANDS TABLE
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    country_origin VARCHAR(100),
    founded_year INTEGER,
    website_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_founded_year CHECK (founded_year > 1600 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- WATCHES TABLE (Master catalog)
CREATE TABLE watches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    reference_number VARCHAR(100),
    brand_id UUID REFERENCES brands(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    specifications JSONB,
    base_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_limited_edition BOOLEAN DEFAULT FALSE,
    production_year INTEGER,
    case_material VARCHAR(100),
    case_diameter VARCHAR(20),
    movement_type VARCHAR(100),
    movement_brand VARCHAR(100),
    power_reserve VARCHAR(50),
    water_resistance VARCHAR(50),
    dial_color VARCHAR(50),
    bracelet_material VARCHAR(100),
    crystal_type VARCHAR(50),
    functions TEXT[],
    weight_grams DECIMAL(6,2),
    thickness_mm DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT positive_price CHECK (base_price > 0),
    CONSTRAINT valid_production_year CHECK (production_year >= 1800 AND production_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2)
);

-- WATCH IMAGES TABLE
CREATE TABLE watch_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watch_id UUID REFERENCES watches(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    image_type image_type_enum DEFAULT 'gallery',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- USER WATCHES TABLE (Personal collection)
CREATE TABLE user_watches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    watch_id UUID REFERENCES watches(id),
    custom_name VARCHAR(255),
    custom_brand VARCHAR(255),
    custom_model VARCHAR(255),
    purchase_price DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2),
    purchase_date DATE NOT NULL,
    purchase_location VARCHAR(255),
    serial_number VARCHAR(255),
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    status watch_status_enum DEFAULT 'owned',
    sale_price DECIMAL(12,2),
    sale_date DATE,
    sold_to_user_id UUID REFERENCES users(id),
    notes TEXT,
    images JSONB,
    is_authenticated BOOLEAN DEFAULT FALSE,
    authentication_cert_url VARCHAR(500),
    insurance_value DECIMAL(12,2),
    insurance_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_purchase_price CHECK (purchase_price > 0),
    CONSTRAINT positive_current_value CHECK (current_value IS NULL OR current_value > 0),
    CONSTRAINT positive_sale_price CHECK (sale_price IS NULL OR sale_price > 0),
    CONSTRAINT sale_date_logic CHECK (
        (status = 'sold' AND sale_date IS NOT NULL) OR 
        (status != 'sold' AND sale_date IS NULL)
    ),
    CONSTRAINT custom_or_catalog_watch CHECK (
        (watch_id IS NOT NULL) OR 
        (custom_name IS NOT NULL AND custom_brand IS NOT NULL)
    )
);

-- MARKETPLACE LISTINGS TABLE
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) NOT NULL,
    user_watch_id UUID REFERENCES user_watches(id),
    watch_id UUID REFERENCES watches(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    crypto_prices JSONB,
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    is_authenticated BOOLEAN DEFAULT FALSE,
    authentication_cert_url VARCHAR(500),
    shipping_included BOOLEAN DEFAULT TRUE,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    available_quantity INTEGER DEFAULT 1,
    listing_type listing_type_enum DEFAULT 'fixed_price',
    is_featured BOOLEAN DEFAULT FALSE,
    is_negotiable BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    status listing_status_enum DEFAULT 'active',
    featured_until TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_price CHECK (price > 0),
    CONSTRAINT positive_shipping CHECK (shipping_cost >= 0),
    CONSTRAINT positive_quantity CHECK (available_quantity > 0),
    CONSTRAINT listing_source CHECK (
        (user_watch_id IS NOT NULL AND watch_id IS NULL) OR 
        (user_watch_id IS NULL AND watch_id IS NOT NULL)
    )
);

-- ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    seller_id UUID REFERENCES users(id),
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tax_amount DECIMAL(8,2) DEFAULT 0,
    discount_amount DECIMAL(8,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status order_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    notes TEXT,
    tracking_number VARCHAR(100),
    shipping_carrier VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_subtotal CHECK (subtotal > 0),
    CONSTRAINT positive_total CHECK (total_amount > 0),
    CONSTRAINT positive_shipping CHECK (shipping_cost >= 0),
    CONSTRAINT positive_tax CHECK (tax_amount >= 0),
    CONSTRAINT positive_discount CHECK (discount_amount >= 0)
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id),
    watch_name VARCHAR(255) NOT NULL,
    watch_brand VARCHAR(255) NOT NULL,
    watch_model VARCHAR(255),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    condition_rating INTEGER,
    serial_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_unit_price CHECK (unit_price > 0),
    CONSTRAINT positive_total_price CHECK (total_price > 0),
    CONSTRAINT total_price_calculation CHECK (total_price = unit_price * quantity)
);

-- TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    order_id UUID REFERENCES orders(id),
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    crypto_amount DECIMAL(20,8),
    crypto_currency VARCHAR(10),
    exchange_rate DECIMAL(15,8),
    status transaction_status_enum DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_hash VARCHAR(255),
    payment_address VARCHAR(255),
    description TEXT NOT NULL,
    reference_id VARCHAR(255),
    metadata JSONB,
    fee_amount DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_crypto_data CHECK (
        (crypto_amount IS NULL AND crypto_currency IS NULL AND exchange_rate IS NULL) OR
        (crypto_amount IS NOT NULL AND crypto_currency IS NOT NULL AND exchange_rate IS NOT NULL)
    )
);

-- CRYPTO PAYMENTS TABLE
CREATE TABLE crypto_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    crypto_currency VARCHAR(10) NOT NULL,
    crypto_amount DECIMAL(20,8) NOT NULL,
    usd_amount DECIMAL(12,2) NOT NULL,
    exchange_rate DECIMAL(15,8) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255) UNIQUE,
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    payment_status crypto_payment_status_enum DEFAULT 'pending',
    network VARCHAR(50),
    gas_fee DECIMAL(20,8),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_crypto_amount CHECK (crypto_amount > 0),
    CONSTRAINT positive_usd_amount CHECK (usd_amount > 0),
    CONSTRAINT positive_confirmations CHECK (confirmations >= 0),
    CONSTRAINT positive_required_confirmations CHECK (required_confirmations > 0)
);

-- USER FAVORITES TABLE
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    listing_id UUID REFERENCES marketplace_listings(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, listing_id)
);

-- WATCH VALUATIONS TABLE
CREATE TABLE watch_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watch_id UUID REFERENCES watches(id) NOT NULL,
    market_value DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    valuation_date DATE NOT NULL,
    source VARCHAR(100),
    condition_rating INTEGER,
    market_trend VARCHAR(20),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_market_value CHECK (market_value > 0),
    CONSTRAINT valid_condition_rating CHECK (condition_rating IS NULL OR (condition_rating BETWEEN 1 AND 10))
);

-- USER SESSIONS TABLE
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

-- Watches indexes
CREATE INDEX idx_watches_brand ON watches(brand_id);
CREATE INDEX idx_watches_category ON watches(category_id);
CREATE INDEX idx_watches_active ON watches(is_active);
CREATE INDEX idx_watches_price ON watches(base_price);

-- User watches indexes
CREATE INDEX idx_user_watches_user ON user_watches(user_id);
CREATE INDEX idx_user_watches_status ON user_watches(status);
CREATE INDEX idx_user_watches_watch ON user_watches(watch_id);

-- Marketplace indexes
CREATE INDEX idx_marketplace_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_active ON marketplace_listings(status, created_at) WHERE status = 'active';
CREATE INDEX idx_marketplace_price ON marketplace_listings(price);
CREATE INDEX idx_marketplace_featured ON marketplace_listings(is_featured, created_at);

-- Orders indexes
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Transactions indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_currency ON transactions(currency);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);

-- Crypto payments indexes
CREATE INDEX idx_crypto_payments_hash ON crypto_payments(transaction_hash);
CREATE INDEX idx_crypto_payments_order ON crypto_payments(order_id);
CREATE INDEX idx_crypto_payments_status ON crypto_payments(payment_status);

-- Favorites indexes
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_listing ON user_favorites(listing_id);

-- Sessions indexes
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(is_active, expires_at);

-- Full text search indexes
CREATE INDEX idx_watches_search ON watches USING gin(to_tsvector('english', name || ' ' || COALESCE(model, '') || ' ' || COALESCE(description, '')));
CREATE INDEX idx_marketplace_search ON marketplace_listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user balance
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        UPDATE users 
        SET balance = balance + NEW.amount 
        WHERE id = NEW.user_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE users 
        SET balance = balance - OLD.amount 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update listing favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE marketplace_listings 
        SET favorites_count = favorites_count + 1 
        WHERE id = NEW.listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE marketplace_listings 
        SET favorites_count = favorites_count - 1 
        WHERE id = OLD.listing_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'LUX' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 1;

-- Apply updated_at triggers
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_watches_updated_at BEFORE UPDATE ON watches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_user_watches_updated_at BEFORE UPDATE ON user_watches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_marketplace_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_crypto_payments_updated_at BEFORE UPDATE ON crypto_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply balance update trigger
CREATE TRIGGER trigger_update_balance AFTER INSERT OR UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_user_balance();

-- Apply favorites count trigger
CREATE TRIGGER trigger_favorites_count_insert AFTER INSERT ON user_favorites FOR EACH ROW EXECUTE FUNCTION update_favorites_count();
CREATE TRIGGER trigger_favorites_count_delete AFTER DELETE ON user_favorites FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Apply order number generation trigger
CREATE TRIGGER trigger_generate_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert popular watch brands
INSERT INTO brands (name, country_origin, founded_year, description) VALUES
('Rolex', 'Switzerland', 1905, 'Swiss luxury watch manufacturer known for precision and prestige'),
('Patek Philippe', 'Switzerland', 1839, 'Swiss luxury watch manufacturer, one of the oldest watch manufacturers in the world'),
('Audemars Piguet', 'Switzerland', 1875, 'Swiss manufacturer of luxury mechanical watches and clocks'),
('Omega', 'Switzerland', 1848, 'Swiss luxury watchmaker with a rich heritage in precision timekeeping'),
('Cartier', 'France', 1847, 'French luxury goods conglomerate which designs and manufactures watches'),
('Breitling', 'Switzerland', 1884, 'Swiss luxury watchmaker specializing in aviation watches'),
('TAG Heuer', 'Switzerland', 1860, 'Swiss luxury watchmaker known for sports watches and chronographs'),
('IWC Schaffhausen', 'Switzerland', 1868, 'Swiss luxury watch manufacturer located in Schaffhausen, Switzerland'),
('Hublot', 'Switzerland', 1980, 'Swiss luxury watchmaker known for its fusion of traditional and modern materials'),
('Panerai', 'Italy', 1860, 'Italian luxury watch manufacturer with a history in military timepieces');

-- Insert watch categories
INSERT INTO categories (name, slug, description) VALUES
('Sport Watch', 'sport-watch', 'Watches designed for active lifestyles and sports activities'),
('Dress Watch', 'dress-watch', 'Elegant timepieces perfect for formal occasions'),
('Diving Watch', 'diving-watch', 'Water-resistant watches designed for underwater activities'),
('Chronograph', 'chronograph', 'Watches with stopwatch functionality'),
('Pilot Watch', 'pilot-watch', 'Aviation-inspired timepieces with legible dials'),
('GMT Watch', 'gmt-watch', 'Watches that display multiple time zones'),
('Complication', 'complication', 'Watches with additional functions beyond basic timekeeping'),
('Vintage', 'vintage', 'Classic timepieces from past eras'),
('Limited Edition', 'limited-edition', 'Exclusive watches produced in limited quantities');

-- Insert sample watches
INSERT INTO watches (name, model, reference_number, brand_id, category_id, base_price, description, specifications, case_material, movement_type, water_resistance, dial_color) VALUES
('Submariner Date', 'Submariner', '126610LN', 
 (SELECT id FROM brands WHERE name = 'Rolex'), 
 (SELECT id FROM categories WHERE name = 'Diving Watch'), 
 12500, 
 'Iconic diving watch with date display and unidirectional rotating bezel',
 '{"movement": "Automatic", "power_reserve": "70 hours", "jewels": 31}',
 'Oystersteel', 'Automatic', '300m', 'Black'),

('Nautilus', '5711/1A', '5711/1A-010',
 (SELECT id FROM brands WHERE name = 'Patek Philippe'),
 (SELECT id FROM categories WHERE name = 'Sport Watch'),
 85000,
 'Luxury sport watch with integrated bracelet and elegant design',
 '{"movement": "Automatic", "power_reserve": "45 hours", "jewels": 29}',
 'Stainless Steel', 'Automatic', '120m', 'Blue'),

('Royal Oak Offshore', 'Royal Oak', '26470ST.OO.A027CA.01',
 (SELECT id FROM brands WHERE name = 'Audemars Piguet'),
 (SELECT id FROM categories WHERE name = 'Chronograph'),
 32000,
 'Bold chronograph with octagonal bezel and distinctive design',
 '{"movement": "Automatic", "power_reserve": "50 hours", "jewels": 59}',
 'Stainless Steel', 'Automatic', '100m', 'Black'),

('Speedmaster Professional', 'Speedmaster', '310.30.42.50.01.001',
 (SELECT id FROM brands WHERE name = 'Omega'),
 (SELECT id FROM categories WHERE name = 'Chronograph'),
 6500,
 'The legendary moonwatch worn by NASA astronauts',
 '{"movement": "Manual", "power_reserve": "48 hours", "jewels": 18}',
 'Stainless Steel', 'Manual', '50m', 'Black'),

('Santos de Cartier', 'Santos', 'WSSA0018',
 (SELECT id FROM brands WHERE name = 'Cartier'),
 (SELECT id FROM categories WHERE name = 'Dress Watch'),
 7200,
 'Iconic square watch with Roman numerals and blue hands',
 '{"movement": "Automatic", "power_reserve": "42 hours", "jewels": 23}',
 'Stainless Steel', 'Automatic', '100m', 'Silver');

-- Insert sample admin user
INSERT INTO users (name, email, password_hash, user_type, store_name, balance, is_active, email_verified) VALUES
('Admin User', 'admin@luxtime.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewf5pUiaq3PBmh/2', 'store', 'LuxTime Store', 10000.00, true, true);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active marketplace listings with watch details
CREATE VIEW v_active_listings AS
SELECT 
    ml.id,
    ml.title,
    ml.description,
    ml.price,
    ml.crypto_prices,
    ml.condition_rating,
    ml.is_authenticated,
    ml.shipping_included,
    ml.shipping_cost,
    ml.views_count,
    ml.favorites_count,
    ml.created_at,
    u.name as seller_name,
    u.user_type as seller_type,
    w.name as watch_name,
    w.model as watch_model,
    b.name as brand_name,
    c.name as category_name,
    (SELECT image_url FROM watch_images WHERE watch_id = w.id AND image_type = 'main' LIMIT 1) as main_image
FROM marketplace_listings ml
JOIN users u ON ml.seller_id = u.id
LEFT JOIN watches w ON ml.watch_id = w.id
LEFT JOIN user_watches uw ON ml.user_watch_id = uw.id
LEFT JOIN watches w2 ON uw.watch_id = w2.id
LEFT JOIN brands b ON COALESCE(w.brand_id, w2.brand_id) = b.id
LEFT JOIN categories c ON COALESCE(w.category_id, w2.category_id) = c.id
WHERE ml.status = 'active' AND u.is_active = true;

-- View for user transaction summary
CREATE VIEW v_user_transaction_summary AS
SELECT 
    user_id,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_debits,
    SUM(amount) as net_amount,
    MAX(created_at) as last_transaction_date
FROM transactions 
WHERE status = 'approved'
GROUP BY user_id;

-- View for watch collection value
CREATE VIEW v_user_collection_value AS
SELECT 
    user_id,
    COUNT(*) as total_watches,
    SUM(purchase_price) as total_investment,
    SUM(COALESCE(current_value, purchase_price)) as current_value,
    SUM(COALESCE(current_value, purchase_price) - purchase_price) as unrealized_gain_loss
FROM user_watches
WHERE status IN ('owned', 'for_sale')
GROUP BY user_id;

-- =====================================================
-- SECURITY POLICIES (RLS)
-- =====================================================

-- Enable Row Level Security
ALTER TABLE user_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for user_watches (users can only see their own watches)
CREATE POLICY user_watches_policy ON user_watches
    FOR ALL TO authenticated
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policies for transactions (users can only see their own transactions)
CREATE POLICY transactions_policy ON transactions
    FOR ALL TO authenticated
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policies for user_favorites (users can only see their own favorites)
CREATE POLICY user_favorites_policy ON user_favorites
    FOR ALL TO authenticated
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policies for user_sessions (users can only see their own sessions)
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL TO authenticated
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- Policies for notifications (users can only see their own notifications)
CREATE POLICY notifications_policy ON notifications
    FOR ALL TO authenticated
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- =====================================================
-- USEFUL STORED PROCEDURES
-- =====================================================

-- Function to get user's portfolio summary
CREATE OR REPLACE FUNCTION get_user_portfolio_summary(p_user_id UUID)
RETURNS TABLE (
    total_watches INTEGER,
    total_investment DECIMAL(15,2),
    current_value DECIMAL(15,2),
    unrealized_gain_loss DECIMAL(15,2),
    account_balance DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_watches,
        SUM(uw.purchase_price) as total_investment,
        SUM(COALESCE(uw.current_value, uw.purchase_price)) as current_value,
        SUM(COALESCE(uw.current_value, uw.purchase_price) - uw.purchase_price) as unrealized_gain_loss,
        u.balance as account_balance
    FROM user_watches uw
    JOIN users u ON u.id = p_user_id
    WHERE uw.user_id = p_user_id AND uw.status IN ('owned', 'for_sale')
    GROUP BY u.balance;
END;
$$ LANGUAGE plpgsql;

-- Function to search watches
CREATE OR REPLACE FUNCTION search_watches(
    p_search_term TEXT DEFAULT NULL,
    p_brand_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    watch_id UUID,
    name VARCHAR(255),
    brand_name VARCHAR(100),
    category_name VARCHAR(100),
    base_price DECIMAL(12,2),
    main_image VARCHAR(500),
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id as watch_id,
        w.name,
        b.name as brand_name,
        c.name as category_name,
        w.base_price,
        (SELECT wi.image_url FROM watch_images wi WHERE wi.watch_id = w.id AND wi.image_type = 'main' LIMIT 1) as main_image,
        CASE 
            WHEN p_search_term IS NOT NULL THEN
                ts_rank(to_tsvector('english', w.name || ' ' || COALESCE(w.model, '') || ' ' || COALESCE(w.description, '')), 
                       plainto_tsquery('english', p_search_term))
            ELSE 1.0
        END as relevance_score
    FROM watches w
    JOIN brands b ON w.brand_id = b.id
    LEFT JOIN categories c ON w.category_id = c.id
    WHERE 
        w.is_active = true
        AND (p_search_term IS NULL OR 
             to_tsvector('english', w.name || ' ' || COALESCE(w.model, '') || ' ' || COALESCE(w.description, '')) @@ plainto_tsquery('english', p_search_term))
        AND (p_brand_id IS NULL OR w.brand_id = p_brand_id)
        AND (p_category_id IS NULL OR w.category_id = p_category_id)
        AND (p_min_price IS NULL OR w.base_price >= p_min_price)
        AND (p_max_price IS NULL OR w.base_price <= p_max_price)
    ORDER BY 
        CASE WHEN p_search_term IS NOT NULL THEN relevance_score ELSE 1 END DESC,
        w.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'LuxTime database schema has been successfully created!';
    RAISE NOTICE 'Total tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE 'Total indexes created: %', (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE 'Database is ready for use.';
END
$$;
