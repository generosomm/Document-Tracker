<?php
// assets/api/save_document.php

// 1. CONFIGURATION
session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
session_start(); // Start session to access user role

error_reporting(E_ALL);
ini_set('display_errors', 0); 
date_default_timezone_set('Asia/Manila'); 
ob_start();

require_once __DIR__ . '/api_init.php';
$response = [];

try {
    
    $chk->close();
    // =========================================================


    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception("Invalid Request Method");
    if (!isset($_POST['id']) || !isset($_POST['title'])) throw new Exception("Missing required fields");

    $doc_id   = $_POST['id'];
    $title    = $_POST['title'];
    $description = $_POST['description'] ?? '';
    $dept     = $_POST['dept'];
    $category = $_POST['category'];
    $assignee = $_POST['assignee'] ?? '';
    $custom_route = $_POST['route_sequence'] ?? null; 
    $status   = 'pending';
    $progress = 0;
    
    // Changed from date('Y-m-d') to date('Y-m-d H:i:s') to include Time
    $created  = date('Y-m-d H:i:s'); 

    // 4. FILE UPLOAD LOGIC
    $uploadedFileName = ""; 
    if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = "../uploads/"; 
        if (!is_dir($uploadDir)) {
            if (!@mkdir($uploadDir, 0777, true)) {
                throw new Exception("Failed to create upload directory.");
            }
        }

        $originalName = basename($_FILES["pdf_file"]["name"]);
        $cleanName = preg_replace("/[^a-zA-Z0-9\._-]/", "", $originalName);
        $finalFileName = time() . "_" . $cleanName;
        $targetFilePath = $uploadDir . $finalFileName;

        if (move_uploaded_file($_FILES["pdf_file"]["tmp_name"], $targetFilePath)) {
            $uploadedFileName = $finalFileName;
        } else {
            throw new Exception("Failed to move uploaded file.");
        }
    }

    // 5. INSERT DOCUMENT
    $sql = "INSERT INTO documents (doc_id, title, description, dept, status, category, file_path, created_date, progress, assignee, custom_route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Database Prepare Error: " . $conn->error);
    }

    // Bind parameters (Added 's' for string at end for custom_route)
    $stmt->bind_param("ssssssssiss", $doc_id, $title, $description, $dept, $status, $category, $uploadedFileName, $created, $progress, $assignee, $custom_route);

    if ($stmt->execute()) {
        
        // 6. TIMELINE EVENT - Always create "Document Created" entry
        $timelineUser = $_POST['timeline_user'] ?? $_SESSION['full_name'] ?? 'System';
        $timelineRole = $_POST['timeline_role'] ?? $_SESSION['department'] ?? 'Admin';
        $details = isset($_POST['timeline_details']) ? $_POST['timeline_details'] : 'Document created and assigned for processing';
        $now     = date('Y-m-d H:i:s');
        $icon    = 'ri-upload-cloud-line';
        $action  = 'Document Created';

        $stmt_tl = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt_tl) {
            $stmt_tl->bind_param("sssssss", $doc_id, $timelineUser, $timelineRole, $action, $now, $icon, $details);
            $stmt_tl->execute();
            $stmt_tl->close();
        }
        
        // If additional timeline data was provided (legacy support)
        if (isset($_POST['timeline_data'])) {
            $tl = json_decode($_POST['timeline_data'], true);
            if (is_array($tl)) {
                $user    = $tl['user'] ?? $timelineUser;
                $role    = $tl['role'] ?? $timelineRole;
                $action  = $tl['action'] ?? 'Created';
                $details = $tl['details'] ?? 'Document created';
                $now     = date('Y-m-d H:i:s');
                $icon    = 'ri-upload-cloud-line';

                $stmt_tl = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if ($stmt_tl) {
                    $stmt_tl->bind_param("sssssss", $doc_id, $user, $role, $action, $now, $icon, $details);
                    $stmt_tl->execute();
                    $stmt_tl->close();
                }
            }
        }

        $response = ["success" => true, "message" => "Saved successfully"];

    } else {
        throw new Exception("Database Insert Failed: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    $response = ["success" => false, "message" => $e->getMessage()];
}

ob_clean();
echo json_encode($response);
?>