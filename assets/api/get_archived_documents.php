<?php
// assets/api/get_archived_documents.php

session_start();
require_once __DIR__ . '/api_init.php';


// 1. SELECT DOCUMENTS WITH ARCHIVE STATUSES
// We select 'doc_id as id' so the Javascript works with 'doc.id'
$sql = "SELECT doc_id as id, title, dept, status, category, created_date as date, finalized_by, assignee 
        FROM documents 
        WHERE status IN ('completed', 'released', 'rejected')
        ORDER BY created_date DESC";

$result = $conn->query($sql);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        
        // 2. GET FINALIZED DATE FROM TIMELINE
        // We look for the moment it was marked 'Archived' or 'Completed'
        $tSql = "SELECT timestamp FROM doc_timeline 
                 WHERE doc_id = '{$row['id']}' 
                 AND (action = 'Archived' OR action = 'Document Completed' OR status = 'completed') 
                 ORDER BY id DESC LIMIT 1";
        
        $tRes = $conn->query($tSql);
        
        if($tRes && $tRes->num_rows > 0) {
            $tRow = $tRes->fetch_assoc();
            $row['dateFinalized'] = date('Y-m-d', strtotime($tRow['timestamp']));
        } else {
            // Fallback: If no timeline entry, use created date or today
            $row['dateFinalized'] = $row['date']; 
        }

        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
?>