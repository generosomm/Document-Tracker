<?php
// assets/api/verify_otp.php

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

require_once __DIR__ . '/api_init.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'OTP endpoint only accepts POST requests']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$otp_input = $input['otp'] ?? '';

if (empty($email) || empty($otp_input)) {
    echo json_encode(['success' => false, 'message' => 'Missing OTP or Email']);
    exit;
}

// 1. Check if OTP matches and is NOT expired
$stmt = $conn->prepare("SELECT id, name, role, dept FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()");
$stmt->bind_param("ss", $email, $otp_input);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // 2. OTP is valid! Clear it so it can't be used again
    $clear = $conn->prepare("UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?");
    $clear->bind_param("i", $user['id']);
    $clear->execute();

    // 3. CREATE SESSION (Login Success)
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['full_name'] = $user['name'];
    $_SESSION['department'] = $user['dept'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['last_login'] = date('Y-m-d H:i:s');

    echo json_encode(['success' => true, 'message' => 'Login Successful', 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid or Expired OTP']);
}

$stmt->close();
$conn->close();
?>
