<?php
// assets/api/check_permission.php
session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
session_start();
require_once __DIR__ . '/api_init.php';


if (!isset($_SESSION['role'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$role = $_SESSION['role'];
$permissions = [];

// Fetch enabled features for this role
$stmt = $conn->prepare("SELECT feature_key FROM role_permissions WHERE role_name = ? AND is_enabled = 1");
$stmt->bind_param("s", $role);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $permissions[] = $row['feature_key'];
}

echo json_encode(['success' => true, 'role' => $role, 'features' => $permissions]);
$conn->close();
?>