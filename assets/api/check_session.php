<?php
// assets/api/check_session.php
// SECURITY: This is a debug tool - restrict access in production!

session_start();

// Require Super Admin role to access this debug tool
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Super Administrator') {
    http_response_code(403);
    die("<h1>Access Denied</h1><p>This debug tool is restricted to Super Administrators only.</p>");
}

echo "<h1>Session Debugger (Admin Only)</h1>";
echo "<p><strong>Warning:</strong> Remove this file in production!</p>";
echo "<pre>";
print_r($_SESSION); // This prints ALL data currently saved for the logged-in user
echo "</pre>";

if (empty($_SESSION)) {
    echo "<h3 style='color:red'>SESSION IS EMPTY!</h3>";
    echo "<p>This means either:</p>";
    echo "<ul>";
    echo "<li>You are not logged in.</li>";
    echo "<li>Your login script is not using session_start().</li>";
    echo "<li>Your browser is not sending the cookie.</li>";
    echo "</ul>";
}
?>