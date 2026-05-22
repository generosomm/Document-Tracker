<?php
// assets/api/upload_signature.php

// 1. Session Setup
session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
session_start();
require_once __DIR__ . '/api_init.php';


try {
    // 2. Authentication Check (With Fail-Safe)
    $userId = $_SESSION['user_id'] ?? $_POST['client_id'] ?? null;

    if (!$userId) {
        throw new Exception("Authentication failed. User ID missing.");
    }

    if (!isset($_FILES['signature_img'])) {
        throw new Exception("No file received.");
    }

    $file = $_FILES['signature_img'];

    // 3. Validation
    $allowedTypes = ['image/png', 'image/jpeg'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception("Only PNG or JPG files are allowed.");
    }
    
    if ($file['size'] > 5 * 1024 * 1024) { // 5MB Limit
        throw new Exception("File is too large (Max 5MB).");
    }

    // 4. Create Upload Directory
    // Go up two levels from assets/api to get to root, then into uploads
    $uploadDir = '../../uploads/signatures/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // 5. Generate Filename (sig_USERID_TIMESTAMP.png)
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = "sig_" . $userId . "_" . time() . "." . $ext;
    $targetPath = $uploadDir . $filename;

    // 6. Save File & Update Database
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        
        // Path accessible from the browser (relative to the HTML page)
        $webPath = '../uploads/signatures/' . $filename;

        // Update DB
        $stmt = $conn->prepare("UPDATE users SET signature_file = ? WHERE id = ?");
        $stmt->bind_param("si", $webPath, $userId);
        
        if ($stmt->execute()) {
            // Update Session immediately so next check works
            $_SESSION['signature_file'] = $webPath;
            
            echo json_encode(['success' => true, 'path' => $webPath, 'message' => 'Signature saved successfully.']);
        } else {
            throw new Exception("Database update failed: " . $conn->error);
        }
    } else {
        throw new Exception("Failed to move uploaded file.");
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>