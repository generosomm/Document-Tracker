<?php
// Set common API headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Include database connection
if (!file_exists(__DIR__ . '/db_connect.php')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection file missing.']);
    exit;
}
require_once __DIR__ . '/db_connect.php';
?>
