<?php
// assets/api/google_config.php

// 1. Load Composer Libraries
require_once __DIR__ . '/../../vendor/autoload.php';

// 1. CONFIGURE & START SESSION HERE (Do this only once)
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => $_SERVER['HTTP_HOST'],
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// 3. SETUP GOOGLE CLIENT
$client = new Google\Client();

// YOUR KEYS
$client->setClientId(getenv('GOOGLE_CLIENT_ID') ?: 'GOOGLE_CLIENT_ID_HERE');
$client->setClientSecret(getenv('GOOGLE_CLIENT_SECRET') ?: 'GOOGLE_CLIENT_SECRET_HERE');

$client->setRedirectUri(getenv('GOOGLE_REDIRECT_URI') ?: 'http://localhost/Document-Tracker/assets/api/google_callback.php');
//$client->setRedirectUri('https://unalloyed-augural-edgardo.ngrok-free.dev/Document-Tracker/assets/api/google_callback.php'); 
//$client->setRedirectUri('https://suspendible-stephnie-monocable.ngrok-free.dev/Document-Tracker/assets/api/google_callback.php'); 
//$client->setRedirectUri('http://localhost/Document-Tracker/assets/api/google_callback.php'); 


$client->addScope("email");
$client->addScope("profile");
$client->setPrompt('select_account');

// 4. DATABASE CONNECTION
if (file_exists(__DIR__ . '/db_connect.php')) {
    include __DIR__ . '/db_connect.php';
} elseif (file_exists('db_connect.php')) {
    include 'db_connect.php';
} else {
    http_response_code(500);
    error_log("Google Config: Database connection file missing");
    echo json_encode(["error" => "Server configuration error", "success" => false]);
    exit;
}
?>
