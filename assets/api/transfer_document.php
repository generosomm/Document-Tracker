    <?php
    // assets/api/transfer_document.php

    // --- NEW HELPER: CHECK ROLE PERMISSION ---
    function hasPermission($conn, $role, $feature) {
        $stmt = $conn->prepare("SELECT 1 FROM role_permissions WHERE role_name = ? AND feature_key = ? AND is_enabled = 1");
        $stmt->bind_param("ss", $role, $feature);
        $stmt->execute();
        $res = $stmt->get_result();
        return $res->num_rows > 0;
    }
    // -

    // HELPER
    function addTimeline($conn, $docId, $user, $role, $action, $icon, $details) {
        if (!ini_get('date.timezone')) date_default_timezone_set('Asia/Manila');
        $now = date('Y-m-d H:i:s');
        $stmt = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("sssssss", $docId, $user, $role, $action, $now, $icon, $details);
            $stmt->execute();
            $stmt->close();
        }
    }

    // HELPER: Calculate Total Routing Time
    function getRoutingTime($conn, $docId) {
        $stmt = $conn->prepare("SELECT MIN(timestamp) as start, MAX(timestamp) as end FROM doc_timeline WHERE doc_id = ? AND (action = 'Document Created' OR action = 'Created' OR action = 'Transferred' OR action LIKE 'Document Completed%')");
        $stmt->bind_param("s", $docId);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        
        if (!$res || !$res['start'] || !$res['end']) return null;
        
        $start = new DateTime($res['start']);
        $end = new DateTime($res['end']);
        $interval = $start->diff($end);
        
        $hours = $interval->h + ($interval->days * 24);
        $minutes = $interval->i;
        $seconds = $interval->s;
        
        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        } else {
            return "{$seconds}s";
        }
    }

    // ERROR HANDLING
    register_shutdown_function(function() {
        $error = error_get_last();
        if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE)) {
            if (ob_get_length()) ob_clean(); 
            require_once __DIR__ . '/api_init.php';
            echo json_encode(['success' => false, 'message' => 'SERVER ERROR: ' . $error['message']]);
            exit;
        }
    });

    session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
    session_start();
    date_default_timezone_set('Asia/Manila');
    ini_set('display_errors', 0); 
    require_once __DIR__ . '/api_init.php';
    

    define('FPDF_PATH', '../libs/fpdf186/fpdf.php');
    define('FPDI_BASE', '../libs/FPDI-2.6.4/src/');

    ob_start();

    try {
        $currentUser = $_SESSION['full_name'] ?? $_POST['client_user'] ?? 'Unknown User';
        $currentDept = $_SESSION['department'] ?? $_POST['client_dept'] ?? 'Unknown Dept';
        $userId = $_SESSION['user_id'] ?? 0;

        if (!$userId && $currentUser !== 'Unknown User') {
            $uStmt = $conn->prepare("SELECT id, dept FROM users WHERE name = ? LIMIT 1");
            $uStmt->bind_param("s", $currentUser);
            $uStmt->execute();
            $uRes = $uStmt->get_result()->fetch_assoc();
            if ($uRes) {
                $userId = $uRes['id'];
                if($currentDept === 'Unknown Dept') $currentDept = $uRes['dept']; 
            }
        }

        $docId = $_POST['doc_id'] ?? '';
        $action = $_POST['action'] ?? '';
        $remarks = $_POST['remarks'] ?? ''; 

        if (empty($docId)) throw new Exception("No Document ID provided");

        $stmt = $conn->prepare("SELECT title, category, assignee, status, finalized_by, file_path FROM documents WHERE doc_id = ?");
        $stmt->bind_param("s", $docId);
        $stmt->execute();
        $doc = $stmt->get_result()->fetch_assoc();
        if (!$doc) throw new Exception("Document not found");

        // --- 1. FETCH ROUTING (Priority: Custom > Fixed) ---
        // First, check if the document has a specific custom route saved
        $docRouteStmt = $conn->prepare("SELECT custom_route FROM documents WHERE doc_id = ?");
        $docRouteStmt->bind_param("s", $docId);
        $docRouteStmt->execute();
        $docRouteRes = $docRouteStmt->get_result()->fetch_assoc();
        
        $sequence = [];

        if (!empty($docRouteRes['custom_route'])) {
            // CASE A: Use Custom Route
            $sequence = json_decode($docRouteRes['custom_route'], true);
        } 
        
        // CASE B: Fallback to Fixed Route if custom is empty/invalid
        if (empty($sequence) || !is_array($sequence)) {
            $routeStmt = $conn->prepare("SELECT route_sequence FROM fixed_routes WHERE category = ?");
            $routeStmt->bind_param("s", $doc['category']);
            $routeStmt->execute();
            $routeRes = $routeStmt->get_result()->fetch_assoc();
            $rawRoute = $routeRes['route_sequence'] ?? '';
            $sequence = json_decode($rawRoute, true);
        }

        // Final Fallback if everything fails
        if (!is_array($sequence) || empty($sequence)) { 
            $sequence = ["OCM", "Records"]; 
        }

        // --- IMPROVED DEPARTMENT MATCHING LOGIC ---
        function getDeptAcronym($name) {
            $name = strtolower(trim($name));
            preg_match('/\((.*?)\)/', $name, $matches);
            if (!empty($matches[1])) {
                return trim($matches[1]); // Returns "ocm"
            }
            return $name;
        }

        function isSameDept($userDept, $docAssignee) {
            $u = strtolower(trim($userDept));
            $d = strtolower(trim($docAssignee));
            
            if ($u === $d) return true;

            $uCore = getDeptAcronym($userDept); 
            $dCore = getDeptAcronym($docAssignee); 
            
            // Matches "OCM" with "Office of the City Mayor (OCM)"
            if ($uCore !== "" && $dCore !== "") {
                if ($uCore === $dCore) return true;
                if (strpos($u, $dCore) !== false) return true;
                if (strpos($d, $uCore) !== false) return true;
            }
            return false;
        }

        function findIdx($sequence, $target) {
            foreach ($sequence as $index => $dept) { 
                if (isSameDept($dept, $target)) return $index; 
            }
            return false;
        }

        // NEW HELPER: Find the correct index considering repeated departments
        // Uses transfer count to determine which occurrence to use
        function findNextIdx($conn, $sequence, $currentDept, $docId) {
            // Find all positions where this department appears
            $allPositions = [];
            foreach ($sequence as $pos => $dept) {
                if (isSameDept($dept, $currentDept)) {
                    $allPositions[] = $pos;
                }
            }
            
            if (empty($allPositions)) return false;
            
            // If department appears only once, return that position
            if (count($allPositions) === 1) {
                return $allPositions[0];
            }
            
            // Count how many times this document has been transferred TO this department
            $countStmt = $conn->prepare("SELECT COUNT(*) as transfer_count FROM doc_timeline WHERE doc_id = ? AND action = 'Transferred' AND details LIKE ?");
            if ($countStmt) {
                $pattern = "%$currentDept%";
                $countStmt->bind_param("ss", $docId, $pattern);
                $countStmt->execute();
                $countRes = $countStmt->get_result()->fetch_assoc();
                $transferCount = intval($countRes['transfer_count']);
                $countStmt->close();
                
                // transferCount = 0: first time at this dept
                // transferCount = 1: first time returning to this dept (go to 2nd occurrence if exists)
                // etc.
                if ($transferCount < count($allPositions)) {
                    return $allPositions[$transferCount];
                } else {
                    // If we've visited all occurrences, stay at the last one
                    return $allPositions[count($allPositions) - 1];
                }
            }
            
            return $allPositions[0];
        }
        // ------------------------------------------

        $isCorrectDept = isSameDept($currentDept, $doc['assignee']);
        $isCorrectDept = isSameDept($currentDept, $doc['assignee']);

        // --- UPLOAD ONLY ---
        if ($action === 'upload_signature') {
            $newSigPath = "";
            if (isset($_FILES['signature']) && $_FILES['signature']['error'] === 0) {
                $ext = strtolower(pathinfo($_FILES['signature']['name'], PATHINFO_EXTENSION));
                if(in_array($ext, ['png', 'jpg', 'jpeg'])) {
                    $targetDir = "../uploads/signatures/";
                    if (!is_dir($targetDir)) mkdir($targetDir, 0777, true);
                    $filename = "sig_" . $userId . "_" . time() . "." . $ext;
                    if (move_uploaded_file($_FILES['signature']['tmp_name'], $targetDir . $filename)) {
                        $dbPath = "../assets/uploads/signatures/" . $filename;
                        $newSigPath = $dbPath; 
                        if ($userId) {
                            $uUpdate = $conn->prepare("UPDATE users SET signature_file = ? WHERE id = ?");
                            $uUpdate->bind_param("si", $dbPath, $userId);
                            $uUpdate->execute();
                        }
                        echo json_encode(['success' => true, 'message' => "Signature uploaded.", 'new_sig_path' => $newSigPath]);
                    } else { echo json_encode(['success' => false, 'message' => "Failed to move file."]); }
                } else { echo json_encode(['success' => false, 'message' => "Invalid file type."]); }
            } else { echo json_encode(['success' => false, 'message' => "No file."]); }
            exit;
        }

        // --- SIGN ---
        elseif ($action === 'sign') {
            // --- SECURITY CHECK ---
            $userRole = $_SESSION['role'] ?? 'Guest';
            if (!hasPermission($conn, $userRole, 'sign_document')) {
                throw new Exception("Permission Denied: Your role is not allowed to sign documents.");
            }
            $dbPath = ""; 
            if ($userId) {
                $u = $conn->query("SELECT signature_file FROM users WHERE id=$userId")->fetch_assoc(); 
                $dbPath = $u['signature_file'];
            }

            if (isset($_POST['x_pos']) && isset($_POST['y_pos']) && !empty($doc['file_path'])) {
                $pdfFilename = basename($doc['file_path']);
                $pdfPath     = "../uploads/" . $pdfFilename; 
                
                // Signature Type
                $sigType = $_POST['sig_type'] ?? 'visual';
                
                // Image Path (Only needed for visual)
                $sigFilename = basename($dbPath);
                $phpSigPath  = "../uploads/signatures/" . $sigFilename;

                require_once(FPDF_PATH);
                if (file_exists(FPDI_BASE . 'autoload.php')) require_once(FPDI_BASE . 'autoload.php');
                else {
                    if(file_exists(FPDI_BASE . 'FpdiTrait.php')) require_once(FPDI_BASE . 'FpdiTrait.php');
                    if(file_exists(FPDI_BASE . 'FpdfTpl.php')) require_once(FPDI_BASE . 'FpdfTpl.php');
                    if(file_exists(FPDI_BASE . 'Fpdi.php')) require_once(FPDI_BASE . 'Fpdi.php');
                }

                try {
                    if (!class_exists('\setasign\Fpdi\Fpdi')) throw new Exception("FPDI Class failed to load");
                    $pdf = new \setasign\Fpdi\Fpdi();
                    try { $pageCount = $pdf->setSourceFile($pdfPath); } catch (Exception $e) { throw new Exception("PDF Version Error"); }
                    
                    $targetPage = isset($_POST['page_num']) ? intval($_POST['page_num']) : 1;

                    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                        $tplIdx = $pdf->importPage($pageNo);
                        $size = $pdf->getTemplateSize($tplIdx);
                        
                        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                        $pdf->useTemplate($tplIdx);
                        
                        if ($pageNo == $targetPage) { 
                            $x = floatval($_POST['x_pos']) * $size['width'];
                            $y = floatval($_POST['y_pos']) * $size['height'];
                            $w = floatval($_POST['width_pct'] ?? 0) * $size['width'];
                            $h = floatval($_POST['height_pct'] ?? 0) * $size['height'];
                            
                            if($w <= 0) $w = 50; 
                            
                            // --- DRAWING LOGIC ---
                            if ($sigType === 'pnpki') {
                                // DRAW PROFESSIONAL BADGE MANUALLY
                                $pdf->SetFillColor(255, 255, 255);
                                $pdf->SetDrawColor(16, 185, 129); // Green Border
                                $pdf->Rect($x, $y, $w, $h, 'DF');
                                
                                $pdf->SetFillColor(243, 244, 246);
                                $pdf->Rect($x + 2, $y + 2, 12, 12, 'F');
                                
                                $pdf->SetTextColor(0, 0, 0);
                                $pdf->SetFont('Arial', 'B', 6);
                                $pdf->SetXY($x + 16, $y + 3);
                                $pdf->Write(0, "Digitally Signed by:");
                                
                                $pdf->SetXY($x + 16, $y + 6);
                                $pdf->SetFont('Arial', 'B', 7);
                                $pdf->Write(0, strtoupper($currentUser));
                                
                                $pdf->SetXY($x + 16, $y + 9);
                                $pdf->SetFont('Arial', '', 6);
                                $pdf->SetTextColor(100, 100, 100);
                                $pdf->Write(0, "Date: " . date("Y-m-d"));
                                
                                $pdf->SetXY($x + 16, $y + 12);
                                $pdf->SetFont('Arial', 'B', 6);
                                $pdf->SetTextColor(16, 185, 129);
                                $pdf->Write(0, "Verified by PNPKI");
                                
                            } else {
                                if (file_exists($phpSigPath)) {
                                    $pdf->Image($phpSigPath, $x, $y, $w, $h > 0 ? $h : 0); 
                                }
                            }
                        }
                    }
                    $pdf->Output($pdfPath, 'F');
                } catch (\Throwable $t) { throw new Exception("PDF Error: " . $t->getMessage()); }
            }

            $update = $conn->prepare("UPDATE documents SET status = 'signed' WHERE doc_id = ?");
            $update->bind_param("s", $docId); 
            $update->execute();
            
            // --- FIX START: CAPTURE REMARKS ---
            $remarks = $_POST['remarks'] ?? '';
            $logType = ($_POST['sig_type'] === 'pnpki') ? 'PNPKI Signed' : 'Signed';
            
            if (!empty($remarks)) {
                $logType .= " | Note: " . htmlspecialchars($remarks);
            }
            // --- FIX END ---
            
            $now = date('Y-m-d H:i:s');
            $stmt_tl = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, 'Signed', ?, 'ri-pen-nib-fill', ?)");
            $stmt_tl->bind_param("sssss", $docId, $currentUser, $currentDept, $now, $logType);
            $stmt_tl->execute();

            echo json_encode(['success' => true, 'message' => "Document signed successfully!"]); 
            exit;
        }

        // --- NEW: AS NOTED BY ---
        elseif ($action === 'note') {
            // Anyone can note, no permission check needed (or create a separate permission if needed)
            $remarks = $_POST['remarks'] ?? '';
            
            if (isset($_POST['x_pos']) && isset($_POST['y_pos']) && !empty($doc['file_path'])) {
                $pdfFilename = basename($doc['file_path']);
                $pdfPath     = "../uploads/" . $pdfFilename;

                require_once(FPDF_PATH);
                if (file_exists(FPDI_BASE . 'autoload.php')) require_once(FPDI_BASE . 'autoload.php');
                else {
                    if(file_exists(FPDI_BASE . 'FpdiTrait.php')) require_once(FPDI_BASE . 'FpdiTrait.php');
                    if(file_exists(FPDI_BASE . 'FpdfTpl.php')) require_once(FPDI_BASE . 'FpdfTpl.php');
                    if(file_exists(FPDI_BASE . 'Fpdi.php')) require_once(FPDI_BASE . 'Fpdi.php');
                }

                try {
                    if (!class_exists('\setasign\Fpdi\Fpdi')) throw new Exception("FPDI Class failed to load");
                    $pdf = new \setasign\Fpdi\Fpdi();
                    try { $pageCount = $pdf->setSourceFile($pdfPath); } catch (Exception $e) { throw new Exception("PDF Version Error"); }
                    
                    $targetPage = isset($_POST['page_num']) ? intval($_POST['page_num']) : 1;

                    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                        $tplIdx = $pdf->importPage($pageNo);
                        $size = $pdf->getTemplateSize($tplIdx);
                        
                        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                        $pdf->useTemplate($tplIdx);
                        
                        if ($pageNo == $targetPage) {
                            $x = floatval($_POST['x_pos']) * $size['width'];
                            $y = floatval($_POST['y_pos']) * $size['height'];
                            $w = floatval($_POST['width_pct'] ?? 0) * $size['width'];
                            $h = floatval($_POST['height_pct'] ?? 0) * $size['height'];
                            
                            if($w <= 0) $w = 50;
                            if($h <= 0) $h = 20;
                            
                            // DRAW BLACK TEXT ON TRANSPARENT BACKGROUND
                            $noteText = isset($_POST['note_text']) ? $_POST['note_text'] : 'Note';
                            
                            // Decode HTML entities and clean text
                            $noteText = html_entity_decode($noteText, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                            $noteText = iconv('UTF-8', 'windows-1252//TRANSLIT//IGNORE', $noteText);
                            
                            // Main note text - bold
                            $pdf->SetTextColor(0, 0, 0);
                            $pdf->SetFont('Arial', 'B', 10);
                            $pdf->SetXY($x, $y);
                            
                            // Use MultiCell for proper text wrapping
                            $pdf->MultiCell($w, 5, $noteText, 0, 'L');
                            
                            // Get current Y position after text
                            $currentY = $pdf->GetY();
                            
                            // Add some spacing before separator
                            $currentY += 2;
                            
                            // Draw separator line
                            $pdf->SetDrawColor(102, 102, 102);
                            $pdf->SetLineWidth(0.3);
                            $pdf->Line($x, $currentY, $x + $w, $currentY);
                            
                            // "As Noted By" - smaller and below line
                            $currentY += 2;
                            $pdf->SetFont('Arial', 'B', 7);
                            $pdf->SetXY($x, $currentY);
                            $pdf->Cell($w, 3, "As Noted By: " . strtoupper($currentUser), 0, 1, 'L');
                            
                            // Date
                            $currentY += 3;
                            $pdf->SetFont('Arial', '', 7);
                            $pdf->SetXY($x, $currentY);
                            $pdf->Cell($w, 3, "Date: " . date("Y-m-d H:i"), 0, 1, 'L');
                        }
                    }
                    $pdf->Output($pdfPath, 'F');
                } catch (\Throwable $t) { throw new Exception("PDF Error: " . $t->getMessage()); }
            }
            
            // Log timeline entry (NOT as "Signed")
            $details = "Document acknowledged/noted";
            if (!empty($remarks)) {
                $details .= " | Note: " . htmlspecialchars($remarks);
            }
            
            $now = date('Y-m-d H:i:s');
            $stmt_tl = $conn->prepare("INSERT INTO doc_timeline (doc_id, user, role, action, timestamp, icon, details) VALUES (?, ?, ?, 'Noted', ?, 'ri-checkbox-circle-line', ?)");
            $stmt_tl->bind_param("sssss", $docId, $currentUser, $currentDept, $now, $details);
            $stmt_tl->execute();

            echo json_encode(['success' => true, 'message' => "Document noted successfully!"]); 
            exit;
        }

    // --- TRANSFER ---
    elseif ($action === 'transfer') {
        if (!$isCorrectDept) throw new Exception("Unauthorized.");
        
        // Check if document has been signed OR noted
        $actionStmt = $conn->prepare("SELECT timestamp FROM doc_timeline WHERE doc_id = ? AND action IN ('Signed', 'Noted') ORDER BY timestamp DESC LIMIT 1");
        $actionStmt->bind_param("s", $docId); 
        $actionStmt->execute(); 
        $actionRes = $actionStmt->get_result()->fetch_assoc();
        
        $tStmt = $conn->prepare("SELECT timestamp FROM doc_timeline WHERE doc_id = ? AND action = 'Transferred' ORDER BY timestamp DESC LIMIT 1");
        $tStmt->bind_param("s", $docId); $tStmt->execute(); $tRes = $tStmt->get_result()->fetch_assoc();
        
        $lastAction = $actionRes ? $actionRes['timestamp'] : '0000-00-00';
        $lastArrival = $tRes ? $tRes['timestamp'] : '0000-00-00';
        
        if ($lastAction <= $lastArrival) throw new Exception("Restricted: You must SIGN or NOTE the document first.");
        
        // FIX: Use findNextIdx to handle repeated departments correctly
        $idx = findNextIdx($conn, $sequence, $doc['assignee'], $docId);
        
        if ($idx !== false && $idx < count($sequence) - 1) {
            $nextDept = $sequence[$idx + 1];
            $newStatus = 'pending';
            // Calculate progress based on position in sequence (more accurate with repeated depts)
            $progress = intval((($idx + 2) / count($sequence)) * 100);
            $update = $conn->prepare("UPDATE documents SET assignee = ?, status = ?, progress = ? WHERE doc_id = ?");
            $update->bind_param("ssis", $nextDept, $newStatus, $progress, $docId);
            $msg = "Transferred to {$nextDept}.";
        } else {
            $nextDept = $doc['assignee']; 
            $newStatus = 'completed';     
            $progress = 100;
            $update = $conn->prepare("UPDATE documents SET status = ?, progress = ? WHERE doc_id = ?");
            $update->bind_param("sis", $newStatus, $progress, $docId);
            $routingTime = getRoutingTime($conn, $docId);
            if ($routingTime) {
                $msg = "Document Completed (Ready for Archiving). Total routing time: {$routingTime}";
            } else {
                $msg = "Document Completed (Ready for Archiving).";
            }
        }
        if ($update->execute()) {
            if (!empty($remarks)) $msg .= " Note: " . htmlspecialchars($remarks);
            addTimeline($conn, $docId, $currentUser, $currentDept, "Transferred", "ri-share-forward-fill", $msg);
            
            // Log "In Progress" entry for the next department when transferring
            if ($idx !== false && $idx < count($sequence) - 1) {
                // Note: The "In Progress" entry will be logged by the next department head when they open it
                // This ensures accurate tracking of when they actually start processing
            }
            
            echo json_encode(['success' => true, 'message' => $msg, 'next_dept' => $nextDept, 'doc_title' => $doc['title']]);
        }
        exit;
    }

    elseif ($action === 'update_status') {
        if (!isset($_POST['status'])) throw new Exception("Status required.");
        $newStatus = $_POST['status']; 
        $remarks = $_POST['remarks'] ?? '';
        if ($newStatus === 'rejected') {
            $update = $conn->prepare("UPDATE documents SET status = 'rejected', progress = 100, finalized_by = ? WHERE doc_id = ?");
            $update->bind_param("ss", $currentUser, $docId);
            $actionText = 'Document Rejected';
            $icon = 'ri-close-circle-fill';
            $msg = "Document has been rejected.";
        } elseif ($newStatus === 'progress') {
            // Calculate progress based on current position in routing sequence
            // FIX: Use findNextIdx to properly handle repeated departments
            $idx = findNextIdx($conn, $sequence, $doc['assignee'], $docId);
            $calculatedProgress = 0;
            if ($idx !== false && count($sequence) > 0) {
                // Use $idx + 1 to get the next position
                $calculatedProgress = intval((($idx + 1) / count($sequence)) * 100);
            }
            
            $update = $conn->prepare("UPDATE documents SET status = 'progress', progress = ? WHERE doc_id = ? AND status = 'pending'");
            $update->bind_param("is", $calculatedProgress, $docId);
            $actionText = 'In Progress';
            $icon = 'ri-loader-4-line';
            $msg = "Status updated to In Progress.";
        } else {
            $update = $conn->prepare("UPDATE documents SET status = 'revision' WHERE doc_id = ?");
            $update->bind_param("s", $docId);
            $actionText = 'Returned for Revision';
            $icon = 'ri-arrow-go-back-line';
            $msg = "Returned for revision.";
        }
        if ($update->execute()) {
            if($update->affected_rows > 0) {
                $details = $remarks ? "Note: " . $remarks : "Status updated.";
                addTimeline($conn, $docId, $currentUser, $currentDept, $actionText, $icon, $details);
            }
            echo json_encode(['success' => true, 'message' => $msg]);
        } else { throw new Exception("Database Error"); }
        exit;
    }
    
    elseif ($action === 'unsign') {
            // 1. Get exact record ID and signer name
            $findStmt = $conn->prepare("SELECT id, user FROM doc_timeline WHERE doc_id = ? AND action = 'Signed' ORDER BY timestamp DESC LIMIT 1");
            $findStmt->bind_param("s", $docId);
            $findStmt->execute();
            $signerResult = $findStmt->get_result()->fetch_assoc();
            
            $rowId = $signerResult['id'] ?? null;
            $lastSigner = $signerResult['user'] ?? '';

            // 2. Permission Check
            if (!$rowId || strcasecmp(trim($lastSigner), trim($currentUser)) !== 0) {
                echo json_encode(['success' => false, 'message' => "Permission Denied. Signer mismatch."]);
                exit;
            }

            // 3. PHYSICAL OVERWRITE LOGIC
            $fileStmt = $conn->prepare("SELECT file_path, original_file_path FROM documents WHERE doc_id = ?");
            $fileStmt->bind_param("s", $docId);
            $fileStmt->execute();
            $docFiles = $fileStmt->get_result()->fetch_assoc();

            if (!empty($docFiles['original_file_path'])) {
                // Use absolute paths to ensure the server finds the files correctly
                $uploadDir = realpath(__DIR__ . '/../uploads/') . DIRECTORY_SEPARATOR;
                $backupFile = $uploadDir . basename($docFiles['original_file_path']);
                $currentFile = $uploadDir . basename($docFiles['file_path']);
                
                if (file_exists($backupFile)) {
                    // FORCE overwrite: Copy clean backup over the signed version
                    copy($backupFile, $currentFile);
                }
            }

            // 4. Update Database
            $del = $conn->prepare("DELETE FROM doc_timeline WHERE id = ?");
            $del->bind_param("i", $rowId);
            
            if ($del->execute()) {
                // Revert status to progress to refresh UI
                $revert = $conn->prepare("UPDATE documents SET status = 'progress' WHERE doc_id = ?");
                $revert->bind_param("s", $docId);
                $revert->execute();

                addTimeline($conn, $docId, $currentUser, $currentDept, "Unsigned", "ri-eraser-line", "Signature removed; original document restored.");
                echo json_encode(['success' => true, 'message' => "File restored and signature removed."]);
            } else {
                echo json_encode(['success' => false, 'message' => "Database error: " . $conn->error]);
            }
            exit;
        }

    elseif ($action === 'check_status') {
        // 1. Determine Route Position
        $idx = findIdx($sequence, $doc['assignee']);
        $isLastStep = ($doc['status'] === 'completed' || ($idx !== false && $idx === count($sequence) - 1));
        
        // 2. Get Last Arrival Time
        $tStmt = $conn->prepare("SELECT timestamp FROM doc_timeline WHERE doc_id = ? AND action = 'Transferred' ORDER BY timestamp DESC LIMIT 1");
        $tStmt->bind_param("s", $docId); 
        $tStmt->execute(); 
        $tRes = $tStmt->get_result()->fetch_assoc();
        $lastArrival = $tRes ? $tRes['timestamp'] : '0000-00-00 00:00:00';
        
        // 3. Get Last Signature Time
        $sStmt = $conn->prepare("SELECT timestamp, user FROM doc_timeline WHERE doc_id = ? AND action = 'Signed' ORDER BY timestamp DESC LIMIT 1");
        $sStmt->bind_param("s", $docId); 
        $sStmt->execute(); 
        $sRes = $sStmt->get_result()->fetch_assoc();
        $lastSign = $sRes ? $sRes['timestamp'] : '0000-00-00 00:00:00';
        
        // 4. Core Logic
        $isSigned = ($lastSign > $lastArrival);
        
        // 5. Fetch Latest Remark
        $rStmt = $conn->prepare("SELECT details, user FROM doc_timeline WHERE doc_id = ? ORDER BY id DESC LIMIT 1");
        $rStmt->bind_param("s", $docId); 
        $rStmt->execute(); 
        $rRes = $rStmt->get_result()->fetch_assoc();
        
        // 6. Fetch User's Saved Signature
        $sigPath = null;
        if ($userId) {
            $sigStmt = $conn->prepare("SELECT signature_file FROM users WHERE id = ?");
            $sigStmt->bind_param("i", $userId);
            $sigStmt->execute();
            $sigRes = $sigStmt->get_result()->fetch_assoc();
            $sigPath = $sigRes ? $sigRes['signature_file'] : null;
        }
        
        // 7. Fetch Owner (Uploader) - Robust Check
        // First try 'Created' action
        $oStmt = $conn->prepare("SELECT user FROM doc_timeline WHERE doc_id = ? AND (action = 'Created' OR action = 'Document Created') ORDER BY id ASC LIMIT 1");
        $oStmt->bind_param("s", $docId); 
        $oStmt->execute(); 
        $oRes = $oStmt->get_result()->fetch_assoc();
        
        $owner = $oRes ? $oRes['user'] : null;

        // Fallback: If no 'Created' log found, get the very first log entry
        if (!$owner) {
            $firstStmt = $conn->prepare("SELECT user FROM doc_timeline WHERE doc_id = ? ORDER BY id ASC LIMIT 1");
            $firstStmt->bind_param("s", $docId);
            $firstStmt->execute();
            $firstRes = $firstStmt->get_result()->fetch_assoc();
            $owner = $firstRes ? $firstRes['user'] : 'Unknown';
        }

        // --- FIX: SERVER-SIDE PERMISSION CHECK ---
        $userRole = $_SESSION['role'] ?? 'Guest';
        $hasSignPermission = hasPermission($conn, $userRole, 'sign_document');
        
        // The user can sign ONLY IF:
        // 1. They are in the correct department ($isCorrectDept)
        // 2. Their Role has permission ($hasSignPermission)
        // 3. Or they are Super Admin (Override)
        $canSign = ($isCorrectDept && $hasSignPermission) || ($userRole === 'Super Administrator');
        // ----------------------------------------
        
        echo json_encode([
            'success' => true, 
            'can_sign' => $canSign, // Now fully validated by Server
            'is_correct_dept' => $isCorrectDept, // Whether user is in the current routing location
            'is_last_step' => $isLastStep,
            'status' => $doc['status'], 
            'is_signed' => $isSigned,
            'signer_name' => $isSigned ? $sRes['user'] : null, 
            'saved_signature' => $sigPath, 
            'finalized_by' => $doc['finalized_by'],
            'latest_remark' => $rRes ? $rRes['details'] : "No recent activity.",
            'latest_user' => $rRes ? $rRes['user'] : "",
            'owner' => $owner
        ]); 
        exit;
    }
    elseif ($action === 'archive_document') {
        if ($doc['status'] !== 'completed' && $doc['status'] !== 'released' && !$isCorrectDept) throw new Exception("Unauthorized.");
        $update = $conn->prepare("UPDATE documents SET status = 'completed', progress = 100, finalized_by = ? WHERE doc_id = ?");
        $update->bind_param("ss", $currentUser, $docId);
        if ($update->execute()) {
            addTimeline($conn, $docId, $currentUser, $currentDept, "Archived", "ri-archive-line", "Document Finalized.");
            echo json_encode(['success' => true, 'message' => "Document Archived Successfully"]);
        } else throw new Exception("Update Failed");
        exit;
    }
    elseif ($action === 'release_document') {
        if ($doc['status'] !== 'completed' && $doc['status'] !== 'released') throw new Exception("Doc must be completed first.");
        $update = $conn->prepare("UPDATE documents SET status = 'released' WHERE doc_id = ?");
        $update->bind_param("s", $docId);
        if ($update->execute()) {
            addTimeline($conn, $docId, $currentUser, $currentDept, "Released", "ri-send-plane-fill", "Document Released.");
            echo json_encode(['success' => true, 'message' => "Document Released Successfully"]);
        } else throw new Exception("Update Failed");
        exit;
    }
    elseif ($action === 'get_route_info') {
        // Use findNextIdx to get the correct current position considering repeated departments
        $idx = findNextIdx($conn, $sequence, $doc['assignee'], $docId);
        
        if($doc['status'] === 'completed') $idx = count($sequence);
        
        echo json_encode([
            'success'=>true, 
            'sequence'=>$sequence, 
            'current_step'=>$idx, 
            'status'=>$doc['status']
        ]); 
        exit;
    }
    elseif ($action === 'preview_route') {
        // FIX: Use findNextIdx to handle repeated departments correctly
        $idx = findNextIdx($conn, $sequence, $doc['assignee'], $docId);
        $next = ($idx !== false && $idx < count($sequence)-1) ? $sequence[$idx+1] : "Completed";
        echo json_encode(['success'=>true, 'current'=>$doc['assignee'], 'next'=>$next, 'sequence'=>$sequence, 'has_signed'=>true]); exit;
    }
    elseif ($action === 'view_log') {
        $duration = intval($_POST['duration'] ?? 0);
        $timeStr = ($duration < 60) ? $duration."s" : floor($duration/60)."m ".($duration%60)."s";
        addTimeline($conn, $docId, $currentUser, $currentDept, "Viewed", "ri-eye-line", "Duration: ".$timeStr);
        echo json_encode(['success' => true]); exit;
    }
    elseif ($action === 'download') {
        addTimeline($conn, $docId, $currentUser, $currentDept, "Downloaded", "ri-download-line", "Downloaded PDF copy.");
        echo json_encode(['success' => true]); exit;
    }

} catch (\Throwable $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();
?>