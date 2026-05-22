<?php
// assets/api/get_users.php

require_once __DIR__ . '/api_init.php';
// 1. Connect



$users = [];

// 2. Query
$sql = "SELECT * FROM users";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $users[] = [
            'id'       => $row['id'],
            'name'     => $row['name'],
            'email'    => $row['email'],
            'password' => $row['password'], // Needed for your current JS login check
            'role'     => $row['role'],
            'dept'     => $row['dept']
        ];
    }
}

// 3. Return JSON
echo json_encode($users);

$conn->close();
?>