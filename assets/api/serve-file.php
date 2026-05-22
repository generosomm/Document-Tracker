<?php
// assets/api/serve-file.php

// 1. Database Connection



if (isset($_GET['file_id'])) {
    $docId = $_GET['file_id'];
    
    // 2. Fetch filename from Database
    $stmt = $conn->prepare("SELECT file_path FROM documents WHERE doc_id = ?");
    $stmt->bind_param("s", $docId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $filename = $row['file_path'];
        
        // 3. Construct Path (Relative to this API folder)
        // Adjust this if your 'uploads' folder is at a different level
        $fullPath = "../uploads/" . $filename; 

        // 4. Validate physical file existence
        if (!empty($filename) && file_exists($fullPath)) {
            
            // Define MIME type
            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            switch ($ext) {
                case "pdf": $ctype = "application/pdf"; break;
                case "jpg": $ctype = "image/jpeg"; break;
                case "png": $ctype = "image/png"; break;
                default: $ctype = "application/octet-stream";
            }

            // Clean output buffer to prevent corrupted PDF data
            if (ob_get_length()) ob_end_clean();

            // Set Headers
            header("Content-Type: " . $ctype);
            header("Content-Length: " . filesize($fullPath));
            header("Content-Disposition: inline; filename=\"" . basename($fullPath) . "\"");
            
            // Output File
            readfile($fullPath);
            exit;
        } else {
            // Debugging: Log exact path to server error log if file is missing
            error_log("DTS Error: File not found at " . realpath("../uploads/") . "/" . $filename);
            http_response_code(404);
            echo "Error: Physical file not found on server.";
        }
    } else {
        http_response_code(404);
        echo "Error: Document ID not found in database.";
    }
} else {
    http_response_code(400);
    echo "Error: No file ID provided.";
}
?>