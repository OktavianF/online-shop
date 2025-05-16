-- Database schema for ElegantShop

-- Create pengguna (users) table
CREATE TABLE IF NOT EXISTS pengguna (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_seller BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create alamat_pengguna (user addresses) table
CREATE TABLE IF NOT EXISTS alamat_pengguna (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES pengguna(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create category table
CREATE TABLE IF NOT EXISTS kategori (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create produk (products) table
CREATE TABLE IF NOT EXISTS produk (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    category_id INTEGER REFERENCES kategori(id),
    user_id INTEGER REFERENCES pengguna(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create pesanan (orders) table
CREATE TABLE IF NOT EXISTS pesanan (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES pengguna(id) ON DELETE SET NULL,
    address_id INTEGER REFERENCES alamat_pengguna(id) ON DELETE SET NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    shipping_cost NUMERIC(15, 2) NOT NULL,
    tax NUMERIC(15, 2) NOT NULL,
    total NUMERIC(15, 2) NOT NULL,
    payment_id INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create detail_pesanan (order details) table
CREATE TABLE IF NOT EXISTS detail_pesanan (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES pesanan(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES produk(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pembayaran (payments) table
CREATE TABLE IF NOT EXISTS pembayaran (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES pesanan(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_date TIMESTAMP,
    card_last_four VARCHAR(4),
    card_exp_date VARCHAR(7),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create pengiriman (shipping) table
CREATE TABLE IF NOT EXISTS pengiriman (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES pesanan(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create detailpengiriman (shipping details) table
CREATE TABLE IF NOT EXISTS detailpengiriman (
    id SERIAL PRIMARY KEY,
    shipping_id INTEGER REFERENCES pengiriman(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO kategori (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Fashion', 'Clothing, shoes, and accessories'),
('Home & Living', 'Furniture, decor, and home appliances'),
('Sports', 'Sports equipment and activewear')
ON CONFLICT DO NOTHING;