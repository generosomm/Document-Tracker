<?php
// assets/api/login.php

require_once 'mailer.php'; 
require_once __DIR__ . '/api_init.php';

session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
session_start();
session_unset();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Login endpoint only accepts POST requests']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

// 1. VERIFY CREDENTIALS
$stmt = $conn->prepare("SELECT id, name, email, role, dept, account_type FROM users WHERE email = ? AND password = ?");
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // --- CHECK ACCOUNT TYPE ---

    // A. LOCAL ACCOUNT (Direct Login - NO OTP)
    if ($user['account_type'] === 'local') {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['full_name'] = $user['name'];
        $_SESSION['department'] = $user['dept'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['last_login'] = date('Y-m-d H:i:s');

        echo json_encode([
            'success' => true, 
            'require_otp' => false, // Tells JS to go to dashboard
            'user' => $user,
            'message' => 'Login successful'
        ]);
        exit;
    }

    // B. GOOGLE/HYBRID ACCOUNT (Require OTP)
    // We only generate OTP if account_type is 'google'
    $otp = rand(100000, 999999);
    $upd = $conn->prepare("UPDATE users SET otp_code = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?");
    $upd->bind_param("si", $otp, $user['id']);
    
    if ($upd->execute()) {
        $subject = "Login Verification Code";
        $body = "
            <div style='text-align: center; font-family: sans-serif;'>
                <h2>Verification Required</h2>
                <h1 style='background: #f1f5f9; display: inline-block; padding: 10px 20px; letter-spacing: 5px; border-radius: 6px;'>$otp</h1>
            </div>
        ";

        sendNotificationEmail($email, $subject, $body);

        echo json_encode([
            'success' => true, 
            'require_otp' => true, // Tells JS to show OTP screen
            'email' => $email,
            'message' => 'Credentials accepted. OTP sent.'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error generating OTP']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
}

$stmt->close();
$conn->close();
?>
