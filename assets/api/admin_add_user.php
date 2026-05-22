<?php
// assets/api/admin_add_user.php

// 1. INCLUDE MAILER & DB
require_once 'mailer.php'; 
require_once __DIR__ . '/api_init.php';

session_start();


// 2. SECURITY CHECK
$userRole = $_SESSION['role'] ?? '';
if ($userRole !== 'Admin' && $userRole !== 'Super Administrator') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access']);
    exit;
}

// 3. GET VARIABLES
$email = trim($_POST['email'] ?? '');
$name  = trim($_POST['name'] ?? '');
$pass  = trim($_POST['password'] ?? ''); 

// Fix: Use !empty checks. If JS sends "", force a fallback.
$role  = !empty($_POST['role']) ? $_POST['role'] : 'Staff'; 
$dept  = !empty($_POST['dept']) ? $_POST['dept'] : 'OCM';

$type  = $_POST['account_type'] ?? 'local';

if (empty($email) || empty($name) || empty($pass)) {
    echo json_encode(['success' => false, 'message' => 'Email, Name, and Password are required.']);
    exit;
}

try {
    // 4. CHECK DUPLICATE
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        throw new Exception("User with this email already exists.");
    }

    // 5. INSERT USER (UPDATED TO SAVE account_type)
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, dept, account_type, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)");
    $stmt->bind_param("ssssss", $name, $email, $pass, $role, $dept, $type); // $type comes from $_POST['account_type']

    if ($stmt->execute()) {
        
        // 6. PREPARE EMAIL
        $loginLink = "http://localhost/Document-Tracker/pages/login.html"; 
        $subject = "Welcome to DTS - Account Created";
        
        $loginInstruction = ($type === 'google') 
            ? "You can login using <b>Google Sign-In</b> OR manually (OTP required)." 
            : "You can login manually using the password below.";

        $body = "
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #2563EB; text-align: center;'>Account Pre-Approved</h2>
                <p>Hello <strong>$name</strong>,</p>
                <p>An administrator has created a <strong>" . strtoupper($type) . "</strong> account for you.</p>
                
                <div style='background: #f8fafc; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2563EB;'>
                    <p><strong>Email:</strong> $email</p>
                    <p><strong>Password:</strong> $pass</p>
                    <p><strong>Role:</strong> $role</p>
                </div>
                
                <p>$loginInstruction</p>
                
                <div style='text-align: center; margin-top: 20px;'>
                    <a href='$loginLink' style='background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Login Now</a>
                </div>
            </div>
        ";

        $mailError = ""; 
        $mailSent = sendNotificationEmail($email, $subject, $body, $mailError);

        if ($mailSent) {
            echo json_encode(['success' => true, 'message' => 'User added and invitation email sent!']);
        } else {
            // SOFT FAIL: User created, but email failed (e.g. dummy address)
            // We return 'success' => true so the Admin sees it worked, but with a warning note.
            echo json_encode([
                'success' => true, 
                'message' => 'User added successfully! (Note: Invitation email could not be sent to this address)'
            ]);
        }

    } else {
        throw new Exception("Database Error: " . $conn->error);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>