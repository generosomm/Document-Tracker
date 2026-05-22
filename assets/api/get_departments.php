<?php
// assets/api/get_departments.php

require_once __DIR__ . '/api_init.php';
// Error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);



$departments = [];

try {
    $sql = "SELECT name FROM departments ORDER BY name ASC";
    $result = $conn->query($sql);

    if ($result) {
        while($row = $result->fetch_assoc()) {
            $departments[] = $row['name'];
        }
    }
    
    echo json_encode($departments);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>