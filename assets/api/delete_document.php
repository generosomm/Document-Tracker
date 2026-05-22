<?php
// assets/api/delete_document.php

require_once __DIR__ . '/api_init.php';
session_start();


// 1. SECURITY CHECK: Only Admins can delete
$currentUserRole = $_SESSION['role'] ?? 'Guest';
if ($currentUserRole !== 'Super Administrator') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized Access.']);
    exit;
}

try {
    if (!isset($_POST['doc_id'])) throw new Exception("Document ID is required.");
    $docId = $_POST['doc_id'];

    // 2. GET FILE PATH (To delete the PDF)
    $stmt = $conn->prepare("SELECT file_path FROM documents WHERE doc_id = ?");
    $stmt->bind_param("s", $docId);
    $stmt->execute();
    $result = $stmt->get_result();
    $fileData = $result->fetch_assoc();
    $stmt->close();

    // 3. DELETE PHYSICAL FILE
    if ($fileData && !empty($fileData['file_path'])) {
        // Adjust path if needed based on your folder structure
        $filePath = "../uploads/" . basename($fileData['file_path']); 
        if (file_exists($filePath)) {
            unlink($filePath); // Delete file from server
        }
    }

    // 4. DELETE DATABASE RECORDS
    // Delete Timeline History first (Foreign Key constraint usually requires this, or cascade)
    $delTimeline = $conn->prepare("DELETE FROM doc_timeline WHERE doc_id = ?");
    $delTimeline->bind_param("s", $docId);
    $delTimeline->execute();
    $delTimeline->close();

    // Delete Main Document
    $delDoc = $conn->prepare("DELETE FROM documents WHERE doc_id = ?");
    $delDoc->bind_param("s", $docId);
    
    if ($delDoc->execute()) {
        echo json_encode(['success' => true, 'message' => 'Document deleted successfully.']);
    } else {
        throw new Exception("Database error: Could not delete document.");
    }
    $delDoc->close();

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>