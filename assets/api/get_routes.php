<?php
// assets/api/get_routes.php

require_once __DIR__ . '/api_init.php';
error_reporting(E_ALL);
ini_set('display_errors', 0);



$routes = [];

// Fetch all fixed routes
$sql = "SELECT category, route_sequence FROM fixed_routes ORDER BY category ASC";
$result = $conn->query($sql);

if ($result) {
    while($row = $result->fetch_assoc()) {
        // The sequence is stored as a JSON string in DB, decode it to PHP array
        $sequence = json_decode($row['route_sequence']);
        
        $routes[] = [
            'category' => $row['category'],
            'sequence' => $sequence
        ];
    }
}

echo json_encode($routes);
$conn->close();
?>