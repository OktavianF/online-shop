<?php
// Database connection settings
$host = "localhost";
$port = "5432";
$dbname = "onlineShop2";
$user = "postgres";
$password = "postgres";

// Establish database connection
function db_connect() {
    global $host, $port, $dbname, $user, $password;
    
    $connection_string = "host=$host port=$port dbname=$dbname user=$user password=$password";
    
    $conn = pg_connect($connection_string);
    
    if (!$conn) {
        die("Connection failed: " . pg_last_error());
    }
    
    return $conn;
}

// Close database connection
function db_close($conn) {
    pg_close($conn);
}

// Execute query and return result
function db_query($query, $params = []) {
    $conn = db_connect();
    
    if (empty($params)) {
        $result = pg_query($conn, $query);
    } else {
        $result = pg_query_params($conn, $query, $params);
    }
    
    if (!$result) {
        $error = pg_last_error($conn);
        db_close($conn);
        die("Query failed: $error");
    }
    
    db_close($conn);
    return $result;
}

// Fetch all rows from result
function db_fetch_all($result) {
    return pg_fetch_all($result);
}

// Fetch a single row from result
function db_fetch_assoc($result) {
    return pg_fetch_assoc($result);
}

// Get number of affected rows
function db_affected_rows($result) {
    return pg_affected_rows($result);
}

// Get last inserted ID
function db_last_id($conn, $table, $id_column = 'id') {
    $query = "SELECT CURRVAL(pg_get_serial_sequence('$table', '$id_column'))";
    $result = pg_query($conn, $query);
    $row = pg_fetch_row($result);
    return $row[0];
}

// Sanitize input data
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Set response headers for JSON API
function set_json_headers() {
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

// Generate JSON response
function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Generate error response
function json_error($message, $status = 400) {
    json_response(['error' => true, 'message' => $message], $status);
}

// Check if request is AJAX
function is_ajax() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

// Start session if not already started
function ensure_session_started() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
}

// Get user ID from session
function get_user_id() {
    ensure_session_started();
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

// Check if user is authenticated
function is_authenticated() {
    return get_user_id() !== null;
}

// Check if user is a seller
function is_seller() {
    ensure_session_started();
    return isset($_SESSION['is_seller']) && $_SESSION['is_seller'] === true;
}

// Require authentication
function require_auth() {
    if (!is_authenticated()) {
        json_error("Authentication required", 401);
    }
}

// Require seller role
function require_seller() {
    require_auth();
    if (!is_seller()) {
        json_error("Seller privileges required", 403);
    }
}