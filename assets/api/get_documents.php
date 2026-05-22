<?php
// assets/api/get_documents.php

// 1. Setup Headers & Error Reporting
require_once __DIR__ . '/api_init.php';
error_reporting(E_ALL);
ini_set('display_errors', 0); 

// 2. Connect to Database



$documents = [];
$type = $_GET['type'] ?? 'active'; // Default to 'active'

// 3. Build Query Based on Type
if ($type === 'archive') {
    // RECORDS PAGE: Fetch documents that are RELEASED, REJECTED, or explicitly FINALIZED
    $sql = "SELECT * FROM documents 
            WHERE status = 'released' 
               OR status = 'rejected'
               OR (finalized_by IS NOT NULL AND finalized_by != '' AND finalized_by != '-')
            ORDER BY created_date DESC";

} else if ($type === 'analytics' || $type === 'all') {
    // ANALYTICS PAGE: Fetch EVERYTHING
    $sql = "SELECT * FROM documents ORDER BY created_date DESC";

} else {
    // TRACKING PAGE (Active): 
    // Show documents that are NOT released, NOT rejected, and NOT manually finalized.
    // OPTIONAL: You can re-add the '1 DAY' logic here for 'completed' docs if needed.
    $sql = "SELECT * FROM documents 
            WHERE status != 'released' 
              AND status != 'rejected'
              AND (finalized_by IS NULL OR finalized_by = '' OR finalized_by = '-')
            ORDER BY created_date DESC";
}

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $doc_id = $row['doc_id'];
        
        // 4. Fetch Timeline (Using prepared statement for security)
        $timeline = [];
        $tl_stmt = $conn->prepare("SELECT * FROM doc_timeline WHERE doc_id = ? ORDER BY timestamp DESC");
        $tl_stmt->bind_param("s", $doc_id);
        $tl_stmt->execute();
        $tl_result = $tl_stmt->get_result();
        
        if($tl_result) {
            while($t_row = $tl_result->fetch_assoc()) {
                $timeline[] = [
                    'user'    => $t_row['user'],
                    'role'    => $t_row['role'],
                    'action'  => $t_row['action'],
                    'time'    => $t_row['timestamp'], 
                    'icon'    => $t_row['icon'],
                    'details' => $t_row['details']
                ];
            }
        }

        // 5. Build Object
        $documents[] = [
            'id'          => $row['doc_id'],
            'title'       => $row['title'],
            'description' => $row['description'],
            'dept'        => $row['dept'],
            'status'      => $row['status'],
            'category'    => $row['category'],
            'date'        => $row['created_date'],
            'progress'    => (int)$row['progress'],
            'assignee'    => $row['assignee'],
            'finalized_by' => $row['finalized_by'],
            'timeline'    => $timeline
        ];
    }
}

// 6. Output JSON
echo json_encode($documents);
$conn->close();
?>