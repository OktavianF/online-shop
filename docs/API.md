# API Documentation

Dokumen ini menjelaskan endpoint API yang saat ini tersedia di proyek.

## Base Path
`/online-shop/php/api`

---

## 1) Authentication API

### Endpoint
`POST /online-shop/php/api/auth.php`

### Content-Type
`application/json`

### Action: Register
#### Request Body
```json
{
  "action": "register",
  "name": "Nama User",
  "email": "user@example.com",
  "password": "password123",
  "phone": "08123456789"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Registration successful!"
}
```

#### Common Error Response
```json
{
  "error": true,
  "message": "Email is already registered"
}
```

### Action: Login
#### Request Body
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Success Response
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Nama User",
    "email": "user@example.com"
  }
}
```

#### Failed Login Response
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

> Catatan: Endpoint ini juga menginisialisasi session PHP saat login berhasil.

---

## 2) Products API

### Endpoint
`/online-shop/php/api/products.php`

### Headers
- `Content-Type: application/json` untuk `POST`, `PUT`, `DELETE`

### GET Products
`GET /online-shop/php/api/products.php`

#### Query Parameters
- `id` (number, optional): ambil 1 produk
- `category` (number, optional): filter kategori
- `seller` (number, optional): filter seller
- `featured` (boolean/int, optional): filter produk unggulan
- `search` (string, optional): pencarian nama/deskripsi
- `sort_by` (string, optional): `name | price | created_at | stock`
- `sort_dir` (string, optional): `asc | desc`
- `limit` (number, optional, default `20`)
- `offset` (number, optional, default `0`)

#### Success Response (List)
```json
{
  "total": 10,
  "limit": 9,
  "offset": 0,
  "products": []
}
```

#### Success Response (Single Product via `id`)
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "price": "1500000.00"
}
```

### POST Create Product (Seller only)
`POST /online-shop/php/api/products.php`

#### Request Body (minimum)
```json
{
  "name": "Produk Baru",
  "price": 120000,
  "category_id": 1,
  "stock": 10,
  "is_featured": 0,
  "image": "img/product.jpg"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {}
}
```

### PUT Update Product (Seller only)
`PUT /online-shop/php/api/products.php`

#### Request Body (minimum)
```json
{
  "id": 1,
  "name": "Produk Update",
  "price": 150000
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {}
}
```

### DELETE Product (Seller only)
`DELETE /online-shop/php/api/products.php`

#### Request Body
```json
{
  "id": 1
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Authentication & Authorization Notes
- Endpoint create/update/delete product memerlukan user login dan role seller (`is_seller`).
- Mekanisme auth saat ini berbasis session PHP.

## Error Handling Standard
- Respons error umum memiliki format:
```json
{
  "error": true,
  "message": "..."
}
```
- Status code mengikuti konteks (`400`, `401`, `403`, `404`, `405`, dsb.).
