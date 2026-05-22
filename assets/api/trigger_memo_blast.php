<?php
// assets/api/trigger_memo_blast.php

// 1. IGNORE USER ABORT (Keep running even if browser closes connection)
ignore_user_abort(true);
set_time_limit(0);

// 2. LOAD
if (file_exists('mailer.php')) include_once 'mailer.php';
include 'db_connect.php';

// 3. GET DATA
$title  = $_POST['title'] ?? '';
$type   = $_POST['type'] ?? 'Announcement';
$msg    = $_POST['message'] ?? '';
$author = $_POST['author'] ?? 'Admin';
$refNo  = $_POST['ref_no'] ?? '';

if (empty($title) || !function_exists('sendNotificationEmail')) {
    exit;
}

// 4. CLOSE CONNECTION TO BROWSER (Makes JS feel instant)
ob_start();
echo json_encode(['status' => 'blasting']);
header('Connection: close');
header('Content-Length: ' . ob_get_length());
ob_end_flush();
@ob_flush();
flush();

// ==================================================
// BACKGROUND PROCESS STARTS HERE
// ==================================================

// MEMO BLAST EMAIL NOTIFICATIONS DISABLED PER USER REQUEST
// Automatic email notifications for announcements/memos are no longer sent
// This prevents the massive email spam issue reported (100+ emails per day)
// Users can still access memos through the dashboard when they login

// Email sending code removed to stop notification spam
?>