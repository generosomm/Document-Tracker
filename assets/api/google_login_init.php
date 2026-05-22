<?php
// assets/api/google_login_init.php
require_once 'google_config.php';

// Generate the URL
$authUrl = $client->createAuthUrl();

// FIX: Removed the '$' before filter_var
header('Location: ' . filter_var($authUrl, FILTER_SANITIZE_URL));
exit;
?>