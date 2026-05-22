<?php
// assets/api/get_timeline.php

// 1. Buffer output to prevent stray text/warnings
ob_start();

session_start();
date_default_timezone_set('Asia/Manila');
error_reporting(E_ALL);
ini_set('display_errors', 0); // Hide errors from output, log them instead
require_once __DIR__ . '/api_init.php';



$docId = $_GET['doc_id'] ?? '';

if (empty($docId)) {
    ob_end_clean();
    echo json_encode([]);
    exit;
}

try {
    // 2. FETCH ALL DATA FIRST
    // We order by timestamp ASCENDING to calculate the 1st, 2nd, 3rd view correctly
    $stmt = $conn->prepare("SELECT id, user, role, action, timestamp, details FROM doc_timeline WHERE doc_id = ? ORDER BY timestamp ASC");
    $stmt->bind_param("s", $docId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $history = [];
    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    $stmt->close(); // Close connection immediately

    // 3. CALCULATE VIEW COUNTS IN PHP (No extra SQL queries needed)
    $view_counters = [];
    $final_output = [];

    foreach ($history as $item) {
        if ($item['action'] === 'Viewed') {
            // Create a unique key for User + Role
            $key = $item['user'] . '|' . $item['role'];
            
            if (!isset($view_counters[$key])) {
                $view_counters[$key] = 0;
            }
            $view_counters[$key]++;
            
            // Add the count to the item
            $item['view_number'] = $view_counters[$key];
        }
        $final_output[] = $item;
    }

    // 4. REVERSE ARRAY (Show Newest First)
    $final_output = array_reverse($final_output);

    ob_end_clean();
    echo json_encode($final_output);

} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>