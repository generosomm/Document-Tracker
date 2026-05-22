<?php
// assets/api/memo_api.php

session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
session_start();
require_once __DIR__ . '/api_init.php';
date_default_timezone_set('Asia/Manila');
ini_set('display_errors', 0); 



$action = $_POST['action'] ?? '';

try {
    // --- GET ACTIVE MEMOS ---
    if ($action === 'get_memos') {
        // Only fetch active memos (not archived/deleted)
        $sql = "SELECT * FROM memos WHERE archive_status = 'active' ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $memos = [];
        while($row = $result->fetch_assoc()) { 
            // Check if expired
            $days = (int)$row['duration_days'];
            if ($days > 0) {
                $expiry = strtotime($row['created_at'] . " + $days days");
                if (time() > $expiry) {
                    // Auto-archive if expired
                    $conn->query("UPDATE memos SET archive_status = 'expired' WHERE id = " . $row['id']);
                    continue; 
                }
            }
            $memos[] = $row; 
        }
        echo json_encode(['success' => true, 'data' => $memos]);
        exit;
    }

    // --- GET ARCHIVED MEMOS (HISTORY) ---
    if ($action === 'get_archived_memos') {
        $sql = "SELECT *, archive_status as status FROM memos WHERE archive_status IN ('expired', 'deleted') ORDER BY created_at DESC";
        $result = $conn->query($sql);
        $memos = [];
        if ($result) {
            while($row = $result->fetch_assoc()) { $memos[] = $row; }
        }
        // ALWAYS return JSON, even if empty array
        echo json_encode(['success' => true, 'data' => $memos]);
        exit;
    }
    // --- GET DETAILS ---
    if ($action === 'get_memo_details') {
        $stmt = $conn->prepare("SELECT * FROM memos WHERE id = ?");
        $stmt->bind_param("i", $_POST['id']);
        $stmt->execute();
        echo json_encode(['success' => true, 'data' => $stmt->get_result()->fetch_assoc()]);
        exit;
    }

    // --- ADD MEMO ---
    if ($action === 'add_memo') {
        $title = $_POST['title'];
        $msg = $_POST['message'];
        $type = $_POST['type'];
        $author = $_POST['author'] ?? 'System';
        $target = $_POST['target_audience'] ?? 'All';
        $duration = (int)($_POST['duration_days'] ?? 7);

        // Ref No
        $res = $conn->query("SELECT id FROM memos ORDER BY id DESC LIMIT 1");
        $lastId = ($res->num_rows > 0) ? $res->fetch_assoc()['id'] : 0;
        $refNo = "MEMO-" . date('Y') . "-" . str_pad($lastId + 1, 3, '0', STR_PAD_LEFT);

        // File
        $attachmentPath = null;
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === 0) {
            $ext = pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION);
            $filename = "MEMO_" . time() . "." . $ext;
            if(move_uploaded_file($_FILES['attachment']['tmp_name'], "../uploads/memos/" . $filename)){
                $attachmentPath = "../assets/uploads/memos/" . $filename;
            }
        }

        $stmt = $conn->prepare("INSERT INTO memos (title, message, type, ref_no, created_by, attachment, target_audience, duration_days, archive_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmt->bind_param("sssssssi", $title, $msg, $type, $refNo, $author, $attachmentPath, $target, $duration);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'ref_no' => $refNo]);
        } else throw new Exception($stmt->error);
        exit;
    }

    // --- UPDATE MEMO ---
    if ($action === 'update_memo') {
        $id = $_POST['id'];
        $title = $_POST['title'];
        $msg = $_POST['message'];
        $type = $_POST['type'];
        $target = $_POST['target_audience'];
        $duration = $_POST['duration_days'];

        $sql = "UPDATE memos SET title=?, message=?, type=?, target_audience=?, duration_days=? WHERE id=?";
        $types = "ssssii";
        $params = [$title, $msg, $type, $target, $duration, $id];

        // Handle File Replacement
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === 0) {
            $ext = pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION);
            $filename = "MEMO_" . time() . "." . $ext;
            if(move_uploaded_file($_FILES['attachment']['tmp_name'], "../uploads/memos/" . $filename)){
                $sql = "UPDATE memos SET title=?, message=?, type=?, target_audience=?, duration_days=?, attachment=? WHERE id=?";
                $types = "ssssisi";
                $path = "../assets/uploads/memos/" . $filename;
                $params = [$title, $msg, $type, $target, $duration, $path, $id];
            }
        }

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if($stmt->execute()) echo json_encode(['success' => true]);
        else throw new Exception("Update failed");
        exit;
    }

    // --- SOFT DELETE (ARCHIVE) ---
    if ($action === 'delete_memo') {
        $stmt = $conn->prepare("UPDATE memos SET archive_status = 'deleted' WHERE id = ?");
        $stmt->bind_param("i", $_POST['id']);
        if($stmt->execute()) echo json_encode(['success' => true]);
        else throw new Exception("Delete failed");
        exit;
    }

    // --- TRACKING ---
    if ($action === 'track_view') {
        $memoId = $_POST['memo_id'];
        $user = $_POST['user_name'];
        $role = $_POST['user_role'] ?? 'User';
        $duration = (int)$_POST['duration'];
        $dl = (int)$_POST['downloaded'];

        $check = $conn->prepare("SELECT id FROM memo_views WHERE memo_id = ? AND viewer_name = ?");
        $check->bind_param("is", $memoId, $user); $check->execute();
        
        if ($check->get_result()->num_rows > 0) {
            $sql = "UPDATE memo_views SET last_viewed = NOW(), total_duration = total_duration + ?";
            if($dl) $sql .= ", has_downloaded = 1";
            $sql .= " WHERE memo_id = ? AND viewer_name = ?";
            $up = $conn->prepare($sql); $up->bind_param("iis", $duration, $memoId, $user); $up->execute();
        } else {
            $in = $conn->prepare("INSERT INTO memo_views (memo_id, viewer_name, viewer_role, total_duration, has_downloaded) VALUES (?, ?, ?, ?, ?)");
            $in->bind_param("issii", $memoId, $user, $role, $duration, $dl); $in->execute();
        }
        echo json_encode(['success' => true]);
        exit;
    }

    // --- GET STATS ---
    if ($action === 'get_memo_viewers') {
        $stmt = $conn->prepare("SELECT * FROM memo_views WHERE memo_id = ? ORDER BY last_viewed DESC");
        $stmt->bind_param("i", $_POST['memo_id']); $stmt->execute();
        $res = $stmt->get_result();
        $data = [];
        while($r = $res->fetch_assoc()) {
            $sec = $r['total_duration'];
            $r['duration_formatted'] = ($sec < 60) ? $sec."s" : floor($sec/60)."m ".($sec%60)."s";
            $r['first_viewed_formatted'] = date("M d, h:i A", strtotime($r['first_viewed']));
            $data[] = $r;
        }
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>