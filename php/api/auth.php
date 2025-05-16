<?php
require_once '../config.php';

// Set headers
set_json_headers();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);

// Check request method
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if action is set
    if (!isset($data['action'])) {
        json_error("Action is required");
    }
    
    // Handle different actions
    switch ($data['action']) {
        case 'register':
            register_user($data);
            break;
        case 'login':
            login_user($data);
            break;
        case 'logout':
            logout_user();
            break;
        default:
            json_error("Invalid action");
    }
} else {
    json_error("Method not allowed", 405);
}

// Register a new user
function register_user($data) {
    // Validate required fields
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        json_error("Name, email, and password are required");
    }
    
    // Sanitize inputs
    $name = sanitize($data['name']);
    $email = sanitize($data['email']);
    $password = $data['password'];
    $phone = isset($data['phone']) ? sanitize($data['phone']) : null;
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error("Invalid email format");
    }
    
    // Check if email already exists
    $conn = db_connect();
    $check_query = "SELECT id FROM pengguna WHERE email = $1";
    $check_result = pg_query_params($conn, $check_query, [$email]);
    
    if (pg_num_rows($check_result) > 0) {
        db_close($conn);
        json_error("Email is already registered");
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user into database
    $insert_query = "INSERT INTO pengguna (name, email, password, phone, is_seller, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    
    $params = [$name, $email, $hashed_password, $phone, false, date('Y-m-d H:i:s')];
    
    $result = pg_query_params($conn, $insert_query, $params);
    
    if (!$result) {
        db_close($conn);
        json_error("Failed to register user: " . pg_last_error($conn));
    }
    
    $user_id = pg_fetch_result($result, 0, 0);
    
    db_close($conn);
    
    // Return success
    json_response([
        "success" => true,
        "message" => "User registered successfully",
        "user_id" => $user_id
    ]);
}

// Login user
function login_user($data) {
    // Validate required fields
    if (!isset($data['email']) || !isset($data['password'])) {
        json_error("Email and password are required");
    }
    
    // Sanitize inputs
    $email = sanitize($data['email']);
    $password = $data['password'];
    $remember = isset($data['remember']) ? (bool)$data['remember'] : false;
    
    // Get user from database
    $conn = db_connect();
    $query = "SELECT id, name, email, password, is_seller, created_at FROM pengguna WHERE email = $1";
    $result = pg_query_params($conn, $query, [$email]);
    
    if (pg_num_rows($result) === 0) {
        db_close($conn);
        json_error("Invalid email or password", 401);
    }
    
    $user = pg_fetch_assoc($result);
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        db_close($conn);
        json_error("Invalid email or password", 401);
    }
    
    // Start session
    ensure_session_started();
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['is_seller'] = (bool)$user['is_seller'];
    
    // Generate token for API authentication
    $token = bin2hex(random_bytes(32));
    
    // In a real application, we would store this token in the database
    // For this demo, we'll just return it
    
    // Remove password from user array
    unset($user['password']);
    
    db_close($conn);
    
    // Return user data with token
    json_response([
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "user" => $user
    ]);
}

// Logout user
function logout_user() {
    // Start session if not already started
    ensure_session_started();
    
    // Clear session variables
    $_SESSION = [];
    
    // Destroy session
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }
    
    session_destroy();
    
    // Return success
    json_response([
        "success" => true,
        "message" => "Logout successful"
    ]);
}