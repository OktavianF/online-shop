<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$DB_HOST = "localhost";
$DB_PORT = "5432";
$DB_NAME = "online-shop";
$DB_USER = "postgres";
$DB_PASS = "130506";

$conn = pg_connect("host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER password=$DB_PASS");
if (!$conn) {
    echo json_encode(["error" => true, "message" => "Failed to connect to database"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['action'])) {
    echo json_encode(["error" => true, "message" => "Invalid request"]);
    exit;
}

$action = $data['action'];

if ($action === 'register') {
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');
    $phone = trim($data['phone'] ?? '');

    if (!$name || !$email || !$password) {
        echo json_encode(["error" => true, "message" => "Name, email, and password are required"]);
        exit;
    }

    // Check if email already exists
    $check = pg_query_params($conn, "SELECT id FROM pengguna WHERE email = $1", [$email]);
    if (pg_num_rows($check) > 0) {
        echo json_encode(["error" => true, "message" => "Email is already registered"]);
        exit;
    }

    // Insert user
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $insert = pg_query_params($conn,
        "INSERT INTO pengguna (name, email, password, phone) VALUES ($1, $2, $3, $4)",
        [$name, $email, $hashedPassword, $phone]);

    if ($insert) {
        echo json_encode(['success' => true, 'message' => 'Registration successful!']);
    } else {
        echo json_encode(["error" => true, "message" => "Registration failed"]);
    }

} elseif ($action === 'login') {
    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');

    $result = pg_query_params($conn, "SELECT * FROM pengguna WHERE email = $1", [$email]);
    $user = pg_fetch_assoc($result);

    if ($user && password_verify($password, $user['password'])) {
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['is_seller'] = $user['is_seller'];

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
    exit;
} else {
    echo json_encode(["error" => true, "message" => "Unknown action"]);
}