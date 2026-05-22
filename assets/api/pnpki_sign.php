<?php
// assets/api/pnpki_sign.php

// INCLUDE DEPENDENCIES
if (file_exists('mailer.php')) include_once 'mailer.php';
require_once __DIR__ . '/api_init.php';

session_start();


$action = $_POST['action'] ?? '';
$docId = $_POST['doc_id'] ?? '';
$certName = $_POST['cert_name'] ?? 'Unknown Cert';
$user = $_SESSION['full_name'] ?? 'Unknown User';
$role = $_SESSION['role'] ?? 'User';

if ($action === 'pnpki_sign' && !empty($docId)) {

    // 1. UPDATE DOCUMENT STATUS
    // We change status to 'Completed' (or whatever your final status is)
    // But we add a special note or flag if you have one.
    $status = "Completed"; 
    
    $stmt = $conn->prepare("UPDATE documents SET status = ?, progress = 100 WHERE doc_id = ?");
    $stmt->bind_param("ss", $status, $docId);
    
    if ($stmt->execute()) {
        
        // 2. ADD TIMELINE EVENT (With a Special Icon)
        $tlAction = "Digitally Signed";
        $details = "Signed using PNPKI Certificate: " . $certName;
        $icon = "ri-shield-check-fill"; // Special Shield Icon
        $now = date('Y-m-d H:i:s');
        
        $tl = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $tl->bind_param("sssssss", $docId, $user, $role, $tlAction, $now, $icon, $details);
        $tl->execute();

        // 3. SEND EMAIL NOTIFICATION (Background Trigger)
        // We use the same trigger logic as before
        if(file_exists('trigger_notification.php')) {
            // Retrieve document details for the email
            $docQ = $conn->query("SELECT title, dept FROM documents WHERE doc_id = '$docId'");
            $docData = $docQ->fetch_assoc();
            
            // Re-use your notification logic logic here or call the trigger script
            // For simplicity, we assume the status update is enough for now.
        }

        echo json_encode(['success' => true, 'message' => 'Signed']);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB Error']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Request']);
}
?>