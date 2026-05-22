<?php
// assets/api/db_connect.php

// 1. Load Environment Variables (with fallback for backward compatibility)
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

// Try to load .env file from project root
$envPath = __DIR__ . '/../../.env';
loadEnv($envPath);

// 2. Database Credentials (Use .env or fallback to defaults)
$host = $_ENV['DB_HOST'] ?? "localhost";
$user = $_ENV['DB_USER'] ?? "root";
$pass = $_ENV['DB_PASS'] ?? "";
$db   = $_ENV['DB_NAME'] ?? "dts_db";

// 3. Create Connection
$conn = new mysqli($host, $user, $pass, $db);

// 4. Check Connection
if ($conn->connect_error) {
    // Secure error handling - don't expose connection details
    http_response_code(500);
    error_log("Database connection failed: " . $conn->connect_error);
    
    // Return generic error to prevent info leakage
    if (headers_sent() === false) {
        header('Content-Type: application/json');
    }
    echo json_encode(["error" => "Database connection failed", "success" => false]);
    exit;
}

// 5. Set charset to handle special characters correctly
$conn->set_charset("utf8mb4");
?>