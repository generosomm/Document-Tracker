    <?php
    // assets/api/admin_api.php

    // 1. Common Setup
    session_set_cookie_params(['path' => '/', 'samesite' => 'Lax']);
    session_start();
    date_default_timezone_set('Asia/Manila');
    require_once __DIR__ . '/api_init.php';
    

    // 2. Helper to get input (supports both FormData and JSON)
    $action = $_POST['action'] ?? '';
    $json_input = json_decode(file_get_contents('php://input'), true);

    if (empty($action) && isset($json_input['action'])) {
        $action = $json_input['action'];
        $_POST = array_merge($_POST, $json_input); // Merge JSON data into $_POST for easier access
    }

    try {
        // Optional: Add Super Admin Check here
        // if ($_SESSION['role'] !== 'Super Administrator') throw new Exception("Unauthorized");

        switch ($action) {


             // --- DELETE ROLE ---
            case 'delete_role':
                $roleName = $_POST['role_name'];
                
                // Safety: Only protect Super Admin
                if ($roleName === 'Super Administrator') {
                    throw new Exception("Critical: Cannot delete the System Super Administrator.");
                }

                // 2. DELETE (Permissions will auto-delete if you set up foreign keys, otherwise manual)
                // First delete permissions for this role
                $stmt = $conn->prepare("DELETE FROM role_permissions WHERE role_name = ?");
                $stmt->bind_param("s", $roleName);
                $stmt->execute();

                // Then delete the role itself
                $stmt = $conn->prepare("DELETE FROM user_roles WHERE role_name = ?");
                $stmt->bind_param("s", $roleName);
                
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Role deleted successfully']);
                else throw new Exception($stmt->error);
                break;
            // ==========================================
            //               DASHBOARD DATA
            // ==========================================
            case 'get_all_data':
                $response = ['users' => [], 'departments' => [], 'routes' => []];

                // Users
                $res = $conn->query("SELECT id, name, email, role, dept FROM users ORDER BY name ASC");
                while ($row = $res->fetch_assoc()) $response['users'][] = $row;

                // Departments
                $res = $conn->query("SELECT id, name FROM departments ORDER BY name ASC");
                while ($row = $res->fetch_assoc()) $response['departments'][] = $row;

                // Routes
                $res = $conn->query("SELECT id, category, route_sequence FROM fixed_routes ORDER BY category ASC");
                while ($row = $res->fetch_assoc()) {
                    // Handle JSON sequence safely
                    $seq = json_decode($row['route_sequence']);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        // Fallback if stored as comma-separated string
                        $seq = explode(',', $row['route_sequence']);
                    }
                    $row['sequence'] = $seq;
                    $response['routes'][] = $row;
                }
                echo json_encode($response);
                break;

            // --- UPDATE ROLE NAME (Renaming) ---
            case 'update_role':
                $oldName = $_POST['old_name'];
                $newName = trim($_POST['new_name']);
                
                if (empty($newName)) throw new Exception("Role name cannot be empty.");
                if ($oldName === 'Super Administrator') throw new Exception("Cannot rename the Super Administrator role.");

                $conn->begin_transaction();
                try {
                    // 1. Update the Role Definition
                    $stmt = $conn->prepare("UPDATE user_roles SET role_name = ? WHERE role_name = ?");
                    $stmt->bind_param("ss", $newName, $oldName);
                    $stmt->execute();

                    // 2. Update Permissions linked to this role
                    $stmt = $conn->prepare("UPDATE role_permissions SET role_name = ? WHERE role_name = ?");
                    $stmt->bind_param("ss", $newName, $oldName);
                    $stmt->execute();

                    // 3. Update Users who have this role
                    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE role = ?");
                    $stmt->bind_param("ss", $newName, $oldName);
                    $stmt->execute();

                    $conn->commit();
                    echo json_encode(['success' => true, 'message' => 'Role renamed successfully']);
                } catch (Exception $e) {
                    $conn->rollback();
                    throw $e;
                }
                break;

            // ==========================================
            //             USER MANAGEMENT
            // ==========================================
            case 'get_user':
            $id = $_POST['id'];
            // Added 'account_type' to the SELECT list
            $stmt = $conn->prepare("SELECT id, name, email, role, dept, account_type FROM users WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->get_result()->fetch_assoc()]);
            break;

            case 'add_user':
                $name = $_POST['name'];
                $email = $_POST['email'];
                $role = $_POST['role'];
                $dept = $_POST['dept'];
                $pass = $_POST['password']; 
                // In production: $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

                // Check duplicate email
                $chk = $conn->prepare("SELECT id FROM users WHERE email = ?");
                $chk->bind_param("s", $email);
                $chk->execute();
                if ($chk->get_result()->num_rows > 0) throw new Exception("Email already exists");

                $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, dept) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $name, $email, $pass, $role, $dept);
                
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'User added']);
                else throw new Exception($stmt->error);
                break;

            case 'update_user':
                $id = $_POST['id'] ?? '';
                $name = $_POST['name'] ?? '';
                $email = $_POST['email'] ?? '';
                $role = $_POST['role'] ?? '';
                $dept = $_POST['dept'] ?? '';
                $pass = $_POST['password'] ?? '';

                // Validation Logic
                if (empty($id) || empty($email) || empty($role) || empty($dept)) {
                    echo json_encode(['success' => false, 'message' => 'Email, Role and Department cannot be empty.']);
                    exit;
                }

                if (!empty($pass)) {
                    // Update WITH password
                    $stmt = $conn->prepare("UPDATE users SET name=?, email=?, role=?, dept=?, password=? WHERE id=?");
                    $stmt->bind_param("sssssi", $name, $email, $role, $dept, $pass, $id);
                } else {
                    // Update WITHOUT password (keep existing password)
                    $stmt = $conn->prepare("UPDATE users SET name=?, email=?, role=?, dept=? WHERE id=?");
                    $stmt->bind_param("ssssi", $name, $email, $role, $dept, $id);
                }

                if ($stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'User updated successfully.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
                }
                break;

            case 'delete_user':
                $id = $_POST['id'];
                $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'User deleted']);
                else throw new Exception($stmt->error);
                break;

            // ==========================================
            //          DEPARTMENT MANAGEMENT
            // ==========================================
            case 'add_dept':
                $name = $_POST['name'];
                $stmt = $conn->prepare("INSERT INTO departments (name) VALUES (?)");
                $stmt->bind_param("s", $name);
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Department added']);
                else throw new Exception($stmt->error);
                break;

            case 'update_dept':
                $id = $_POST['id'];
                $name = $_POST['name'];
                $stmt = $conn->prepare("UPDATE departments SET name = ? WHERE id = ?");
                $stmt->bind_param("si", $name, $id);
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Department updated']);
                else throw new Exception($stmt->error);
                break;

            case 'delete_dept':
                $id = $_POST['id'];
                $stmt = $conn->prepare("DELETE FROM departments WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Department deleted']);
                else throw new Exception($stmt->error);
                break;


            // --- ROLE PERMISSIONS ---
            case 'get_permissions':
                // 1. Fetch Dynamic Roles from DB
                $roles = [];
                $roleQuery = $conn->query("SELECT role_name FROM user_roles ORDER BY id ASC");
                while($r = $roleQuery->fetch_assoc()) {
                    $roles[] = $r['role_name'];
                }

                // 2. Define Features (Hardcoded is fine as these map to code logic)
                $features = [
                    'manage_system' => 'System Config (Admin)',
                    'view_dashboard' => 'View Dashboard (Home)',
                    'view_tracking' => 'View Document Tracking',
                    'view_records' => 'View Records / Archives',
                    'upload_document' => 'Upload Documents',
                    'upload_memo' => 'Upload Memoranda',
                    'sign_document' => 'Digital Signing (PNPKI)',
                    'view_analytics' => 'View Analytics / Reports',
                    'view_timeline' => 'View Timeline'
                ];
                
                // 3. Fetch Matrix
                $perms = [];
                $res = $conn->query("SELECT * FROM role_permissions");
                while($row = $res->fetch_assoc()) {
                    $perms[$row['role_name']][$row['feature_key']] = $row['is_enabled'];
                }
                
                echo json_encode(['success' => true, 'roles' => $roles, 'features' => $features, 'permissions' => $perms]);
                break;

            case 'add_role':
                $roleName = trim($_POST['role_name']);
                if(empty($roleName)) throw new Exception("Role name required");

                $stmt = $conn->prepare("INSERT INTO user_roles (role_name) VALUES (?)");
                $stmt->bind_param("s", $roleName);
                
                if($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Role added']);
                else throw new Exception($stmt->error);
                break;

            case 'update_permission':
                $role = $_POST['role'];
                $feature = $_POST['feature'];
                $enabled = $_POST['enabled']; 
                
                // BACKEND SAFETY: Prevent Super Administrator from losing System Config access
                if ($role === 'Super Administrator' && $feature === 'manage_system' && $enabled == 0) {
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Security Lock: Cannot disable System Config for Super Administrator'
                    ]);
                    exit;
                }
                
                $stmt = $conn->prepare("INSERT INTO role_permissions (role_name, feature_key, is_enabled) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_enabled = ?");
                $stmt->bind_param("ssii", $role, $feature, $enabled, $enabled);
                
                if ($stmt->execute()) echo json_encode(['success' => true]);
                else throw new Exception($conn->error);
                break;    
            // ==========================================
            //             ROUTE MANAGEMENT
            // ==========================================
            case 'get_route':
                $id = $_POST['id'];
                $stmt = $conn->prepare("SELECT * FROM fixed_routes WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                echo json_encode(['success' => true, 'data' => $stmt->get_result()->fetch_assoc()]);
                break;

            case 'save_route': // Handles both ADD and UPDATE logic
                $id = $_POST['id'] ?? null; // ID determines if it's an update
                $category = $_POST['category'];
                $seqData = $_POST['sequence']; // Can be array or JSON string

                // Ensure sequence is JSON string for DB
                $sequenceStr = is_array($seqData) ? json_encode($seqData) : $seqData;

                if ($id) {
                    // UPDATE
                    $stmt = $conn->prepare("UPDATE fixed_routes SET category=?, route_sequence=? WHERE id=?");
                    $stmt->bind_param("ssi", $category, $sequenceStr, $id);
                } else {
                    // INSERT (ADD)
                    // Use INSERT IGNORE or check exists if you want unique categories
                    $stmt = $conn->prepare("INSERT INTO fixed_routes (category, route_sequence) VALUES (?, ?)");
                    $stmt->bind_param("ss", $category, $sequenceStr);
                }

                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Route saved']);
                else throw new Exception($stmt->error);
                break;

            case 'delete_route':
                $id = $_POST['id'];
                $stmt = $conn->prepare("DELETE FROM fixed_routes WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'Route deleted']);
                else throw new Exception($stmt->error);
                break;

            default:
                throw new Exception("Invalid Action: " . $action);

                
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

    $conn->close();
    ?>