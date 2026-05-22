<?php
// assets/api/trigger_notification.php

// 1. CONFIGURATION: Allow script to run even if browser closes
ignore_user_abort(true);
set_time_limit(0);

// 2. LOAD DEPENDENCIES
if (file_exists('mailer.php')) include_once 'mailer.php';
if (file_exists('db_connect.php')) include 'db_connect.php';

// 3. GET INPUTS
$doc_id = $_POST['doc_id'] ?? '';
$assignee = $_POST['assignee'] ?? '';
$title = $_POST['title'] ?? '';
$dept = $_POST['dept'] ?? '';

// 4. INSTANT RESPONSE TRICK
// This closes the connection to the browser immediately so the JS doesn't wait
ob_start();
echo json_encode(['status' => 'processing']);
header('Connection: close');
header('Content-Length: ' . ob_get_length());
ob_end_flush();
@ob_flush();
flush();

// ============================================================
// EVERYTHING BELOW THIS RUNS IN THE BACKGROUND (Browser is already gone)
// ============================================================

// NOTIFICATIONS DISABLED PER USER REQUEST
// Email notifications for new documents are no longer sent
// This prevents the email spam issue that was sending hundreds of emails daily
// The notification system has been deactivated to maintain system stability

if (empty($doc_id) || empty($assignee)) {
    exit; 
}

// Notification code removed - no emails will be sent
// Users can still view documents in the system when they login
?>