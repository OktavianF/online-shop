<?php
require_once '../config.php';

// Set headers
set_json_headers();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Route the request based on method
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single product
            get_product($_GET['id']);
        } else {
            // Get products list
            get_products();
        }
        break;
        
    case 'POST':
        // Create product - requires seller role
        require_seller();
        create_product();
        break;
        
    case 'PUT':
        // Update product - requires seller role
        require_seller();
        update_product();
        break;
        
    case 'DELETE':
        // Delete product - requires seller role
        require_seller();
        delete_product();
        break;
        
    default:
        json_error("Method not allowed", 405);
}

// Get all products
function get_products() {
    // Parse query parameters
    $category_id = isset($_GET['category']) ? (int)$_GET['category'] : null;
    $seller_id = isset($_GET['seller']) ? (int)$_GET['seller'] : null;
    $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = isset($_GET['search']) ? sanitize($_GET['search']) : null;
    $sort_by = isset($_GET['sort_by']) ? sanitize($_GET['sort_by']) : 'created_at';
    $sort_dir = isset($_GET['sort_dir']) && strtolower($_GET['sort_dir']) === 'asc' ? 'ASC' : 'DESC';
    
    // Build query
    $query = "SELECT p.*, u.name as seller_name 
              FROM produk p 
              JOIN pengguna u ON p.user_id = u.id 
              WHERE 1=1";
    
    $params = [];
    $param_index = 1;
    
    // Add category filter
    if ($category_id !== null) {
        $query .= " AND p.category_id = $" . $param_index++;
        $params[] = $category_id;
    }
    
    // Add seller filter
    if ($seller_id !== null) {
        $query .= " AND p.user_id = $" . $param_index++;
        $params[] = $seller_id;
    }
    
    // Add featured filter
    if ($featured !== null) {
        $query .= " AND p.is_featured = $" . $param_index++;
        $params[] = $featured;
    }
    
    // Add search filter
    if ($search !== null) {
        $query .= " AND (p.name ILIKE $" . $param_index . " OR p.description ILIKE $" . $param_index . ")";
        $params[] = "%$search%";
        $param_index++;
    }
    
    // Add sorting
    $allowed_sort_columns = ['name', 'price', 'created_at', 'stock'];
    if (in_array($sort_by, $allowed_sort_columns)) {
        $query .= " ORDER BY p.$sort_by $sort_dir";
    } else {
        $query .= " ORDER BY p.created_at DESC";
    }
    
    // Add pagination
    $query .= " LIMIT $" . $param_index++ . " OFFSET $" . $param_index++;
    $params[] = $limit;
    $params[] = $offset;
    
    // Execute query
    $result = db_query($query, $params);
    $products = db_fetch_all($result);
    
    // Count total products for pagination
    $count_query = "SELECT COUNT(*) FROM produk p WHERE 1=1";
    $count_params = [];
    $param_index = 1;
    
    // Add category filter
    if ($category_id !== null) {
        $count_query .= " AND p.category_id = $" . $param_index++;
        $count_params[] = $category_id;
    }
    
    // Add seller filter
    if ($seller_id !== null) {
        $count_query .= " AND p.user_id = $" . $param_index++;
        $count_params[] = $seller_id;
    }
    
    // Add featured filter
    if ($featured !== null) {
        $count_query .= " AND p.is_featured = $" . $param_index++;
        $count_params[] = $featured;
    }
    
    // Add search filter
    if ($search !== null) {
        $count_query .= " AND (p.name ILIKE $" . $param_index . " OR p.description ILIKE $" . $param_index . ")";
        $count_params[] = "%$search%";
    }
    
    $count_result = db_query($count_query, $count_params);
    $total = pg_fetch_result($count_result, 0, 0);
    
    // Check if we need to return mock data for development
    if (empty($products) && getenv('APP_ENV') === 'development') {
        $products = get_mock_products($category_id, $limit);
    }
    
    // Return products
    json_response([
        "total" => (int)$total,
        "limit" => $limit,
        "offset" => $offset,
        "products" => $products
    ]);
}

// Get single product by ID
function get_product($id) {
    // Validate ID
    $id = (int)$id;
    
    if ($id <= 0) {
        json_error("Invalid product ID");
    }
    
    // Get product from database
    $query = "SELECT p.*, u.name as seller_name 
              FROM produk p 
              JOIN pengguna u ON p.user_id = u.id 
              WHERE p.id = $1";
    
    $result = db_query($query, [$id]);
    
    if (pg_num_rows($result) === 0) {
        // Check if we need to return mock data for development
        if (getenv('APP_ENV') === 'development') {
            $product = get_mock_product($id);
            if ($product) {
                json_response($product);
            }
        }
        
        json_error("Product not found", 404);
    }
    
    $product = pg_fetch_assoc($result);
    
    // Return product
    json_response($product);
}

// Create a new product
function create_product() {
    // Get user ID from session
    $user_id = get_user_id();
    
    // Parse request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['name']) || !isset($data['price']) || !isset($data['category_id'])) {
        json_error("Name, price, and category are required");
    }
    
    // Sanitize inputs
    $name = sanitize($data['name']);
    $description = isset($data['description']) ? sanitize($data['description']) : '';
    $price = (float)$data['price'];
    $category_id = (int)$data['category_id'];
    $stock = isset($data['stock']) ? (int)$data['stock'] : 0;
    $is_featured = isset($data['is_featured']) ? (bool)$data['is_featured'] : false;
    $image = isset($data['image']) ? sanitize($data['image']) : null;
    
    // Validate inputs
    if (empty($name) || strlen($name) > 255) {
        json_error("Name is required and must be at most 255 characters");
    }
    
    if ($price <= 0) {
        json_error("Price must be greater than 0");
    }
    
    if ($category_id <= 0) {
        json_error("Invalid category ID");
    }
    
    if ($stock < 0) {
        json_error("Stock cannot be negative");
    }
    
    // Insert product into database
    $conn = db_connect();
    $query = "INSERT INTO produk (name, description, price, category_id, user_id, stock, is_featured, image, created_at) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id";
    
    $params = [
        $name,
        $description,
        $price,
        $category_id,
        $user_id,
        $stock,
        $is_featured,
        $image,
        date('Y-m-d H:i:s')
    ];
    
    $result = pg_query_params($conn, $query, $params);
    
    if (!$result) {
        db_close($conn);
        json_error("Failed to create product: " . pg_last_error($conn));
    }
    
    $product_id = pg_fetch_result($result, 0, 0);
    
    // Get the created product
    $get_query = "SELECT p.*, u.name as seller_name 
                  FROM produk p 
                  JOIN pengguna u ON p.user_id = u.id 
                  WHERE p.id = $1";
    
    $get_result = pg_query_params($conn, $get_query, [$product_id]);
    $product = pg_fetch_assoc($get_result);
    
    db_close($conn);
    
    // Return created product
    json_response([
        "success" => true,
        "message" => "Product created successfully",
        "product" => $product
    ], 201);
}

// Update an existing product
function update_product() {
    // Get user ID from session
    $user_id = get_user_id();
    
    // Parse request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate product ID
    if (!isset($data['id'])) {
        json_error("Product ID is required");
    }
    
    $product_id = (int)$data['id'];
    
    if ($product_id <= 0) {
        json_error("Invalid product ID");
    }
    
    // Check if product exists and belongs to the user
    $conn = db_connect();
    $check_query = "SELECT id FROM produk WHERE id = $1 AND user_id = $2";
    $check_result = pg_query_params($conn, $check_query, [$product_id, $user_id]);
    
    if (pg_num_rows($check_result) === 0) {
        db_close($conn);
        json_error("Product not found or you don't have permission to update it", 404);
    }
    
    // Build update query
    $update_fields = [];
    $params = [];
    $param_index = 1;
    
    // Add name if provided
    if (isset($data['name'])) {
        $name = sanitize($data['name']);
        if (empty($name) || strlen($name) > 255) {
            json_error("Name must be at most 255 characters");
        }
        $update_fields[] = "name = $" . $param_index++;
        $params[] = $name;
    }
    
    // Add description if provided
    if (isset($data['description'])) {
        $description = sanitize($data['description']);
        $update_fields[] = "description = $" . $param_index++;
        $params[] = $description;
    }
    
    // Add price if provided
    if (isset($data['price'])) {
        $price = (float)$data['price'];
        if ($price <= 0) {
            json_error("Price must be greater than 0");
        }
        $update_fields[] = "price = $" . $param_index++;
        $params[] = $price;
    }
    
    // Add category_id if provided
    if (isset($data['category_id'])) {
        $category_id = (int)$data['category_id'];
        if ($category_id <= 0) {
            json_error("Invalid category ID");
        }
        $update_fields[] = "category_id = $" . $param_index++;
        $params[] = $category_id;
    }
    
    // Add stock if provided
    if (isset($data['stock'])) {
        $stock = (int)$data['stock'];
        if ($stock < 0) {
            json_error("Stock cannot be negative");
        }
        $update_fields[] = "stock = $" . $param_index++;
        $params[] = $stock;
    }
    
    // Add is_featured if provided
    if (isset($data['is_featured'])) {
        $is_featured = (bool)$data['is_featured'];
        $update_fields[] = "is_featured = $" . $param_index++;
        $params[] = $is_featured;
    }
    
    // Add image if provided
    if (isset($data['image'])) {
        $image = sanitize($data['image']);
        $update_fields[] = "image = $" . $param_index++;
        $params[] = $image;
    }
    
    // Add updated_at
    $update_fields[] = "updated_at = $" . $param_index++;
    $params[] = date('Y-m-d H:i:s');
    
    // Add product ID to params
    $params[] = $product_id;
    
    // Execute update query
    $update_query = "UPDATE produk SET " . implode(", ", $update_fields) . " WHERE id = $" . $param_index;
    
    $result = pg_query_params($conn, $update_query, $params);
    
    if (!$result) {
        db_close($conn);
        json_error("Failed to update product: " . pg_last_error($conn));
    }
    
    // Get the updated product
    $get_query = "SELECT p.*, u.name as seller_name 
                  FROM produk p 
                  JOIN pengguna u ON p.user_id = u.id 
                  WHERE p.id = $1";
    
    $get_result = pg_query_params($conn, $get_query, [$product_id]);
    $product = pg_fetch_assoc($get_result);
    
    db_close($conn);
    
    // Return updated product
    json_response([
        "success" => true,
        "message" => "Product updated successfully",
        "product" => $product
    ]);
}

// Delete a product
function delete_product() {
    // Get user ID from session
    $user_id = get_user_id();
    
    // Parse request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate product ID
    if (!isset($data['id'])) {
        json_error("Product ID is required");
    }
    
    $product_id = (int)$data['id'];
    
    if ($product_id <= 0) {
        json_error("Invalid product ID");
    }
    
    // Check if product exists and belongs to the user
    $conn = db_connect();
    $check_query = "SELECT id FROM produk WHERE id = $1 AND user_id = $2";
    $check_result = pg_query_params($conn, $check_query, [$product_id, $user_id]);
    
    if (pg_num_rows($check_result) === 0) {
        db_close($conn);
        json_error("Product not found or you don't have permission to delete it", 404);
    }
    
    // Delete product
    $delete_query = "DELETE FROM produk WHERE id = $1";
    $delete_result = pg_query_params($conn, $delete_query, [$product_id]);
    
    if (!$delete_result) {
        db_close($conn);
        json_error("Failed to delete product: " . pg_last_error($conn));
    }
    
    db_close($conn);
    
    // Return success
    json_response([
        "success" => true,
        "message" => "Product deleted successfully"
    ]);
}

// Get mock products for development
function get_mock_products($category_id = null, $limit = 10) {
    $products = [
        [
            "id" => 1,
            "name" => "Wireless Headphones",
            "description" => "High-quality wireless headphones with noise cancellation technology.",
            "price" => 1500000,
            "category_id" => 1,
            "user_id" => 1,
            "seller_name" => "TechStore",
            "stock" => 50,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-15 10:00:00"
        ],
        [
            "id" => 2,
            "name" => "Casual T-Shirt",
            "description" => "Comfortable cotton t-shirt for everyday wear.",
            "price" => 249000,
            "category_id" => 2,
            "user_id" => 2,
            "seller_name" => "FashionHub",
            "stock" => 100,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/5698853/pexels-photo-5698853.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-10 14:30:00"
        ],
        [
            "id" => 3,
            "name" => "Smart Watch",
            "description" => "Fitness tracker and smartwatch with heart rate monitoring.",
            "price" => 899000,
            "category_id" => 1,
            "user_id" => 1,
            "seller_name" => "TechStore",
            "stock" => 30,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-20 09:15:00"
        ],
        [
            "id" => 4,
            "name" => "Coffee Maker",
            "description" => "Automatic coffee maker for home and office use.",
            "price" => 750000,
            "category_id" => 3,
            "user_id" => 3,
            "seller_name" => "HomeEssentials",
            "stock" => 20,
            "is_featured" => true,
            "image" => "https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-18 11:20:00"
        ],
        [
            "id" => 5,
            "name" => "Desk Lamp",
            "description" => "LED desk lamp with adjustable brightness and color temperature.",
            "price" => 350000,
            "category_id" => 3,
            "user_id" => 3,
            "seller_name" => "HomeEssentials",
            "stock" => 40,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-25 15:45:00"
        ],
        [
            "id" => 6,
            "name" => "Running Shoes",
            "description" => "Lightweight running shoes with cushioned soles for maximum comfort.",
            "price" => 800000,
            "category_id" => 4,
            "user_id" => 4,
            "seller_name" => "SportyGear",
            "stock" => 25,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-22 13:10:00"
        ],
        [
            "id" => 7,
            "name" => "Denim Jacket",
            "description" => "Classic denim jacket for men and women.",
            "price" => 650000,
            "category_id" => 2,
            "user_id" => 2,
            "seller_name" => "FashionHub",
            "stock" => 15,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/5235413/pexels-photo-5235413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-28 10:30:00"
        ],
        [
            "id" => 8,
            "name" => "Portable Speaker",
            "description" => "Waterproof Bluetooth speaker with 20-hour battery life.",
            "price" => 450000,
            "category_id" => 1,
            "user_id" => 1,
            "seller_name" => "TechStore",
            "stock" => 35,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-01-30 16:20:00"
        ],
        [
            "id" => 9,
            "name" => "Yoga Mat",
            "description" => "Non-slip yoga mat for home and gym workouts.",
            "price" => 200000,
            "category_id" => 4,
            "user_id" => 4,
            "seller_name" => "SportyGear",
            "stock" => 50,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/4757986/pexels-photo-4757986.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-02-01 09:45:00"
        ],
        [
            "id" => 10,
            "name" => "Ceramic Plant Pot",
            "description" => "Decorative ceramic pot for indoor plants.",
            "price" => 125000,
            "category_id" => 3,
            "user_id" => 3,
            "seller_name" => "HomeEssentials",
            "stock" => 60,
            "is_featured" => false,
            "image" => "https://images.pexels.com/photos/5282058/pexels-photo-5282058.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            "created_at" => "2025-02-03 12:15:00"
        ]
    ];
    
    // Filter by category if provided
    if ($category_id !== null) {
        $filtered_products = array_filter($products, function($product) use ($category_id) {
            return $product['category_id'] == $category_id;
        });
        $products = array_values($filtered_products);
    }
    
    // Limit number of products
    if (count($products) > $limit) {
        $products = array_slice($products, 0, $limit);
    }
    
    return $products;
}

// Get mock product by ID for development
function get_mock_product($id) {
    $products = get_mock_products();
    
    foreach ($products as $product) {
        if ($product['id'] == $id) {
            return $product;
        }
    }
    
    return null;
}