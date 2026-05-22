<?php
// assets/api/google_callback.php
ob_start();

require_once 'google_config.php';
require_once 'mailer.php'; 

if (isset($_GET['code'])) {
    try {
        $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        
        if (isset($token['error'])) {
            throw new Exception("Google Token Error: " . $token['error']);
        }

        $client->setAccessToken($token['access_token']);
        $google_oauth = new Google\Service\Oauth2($client);
        $google_account_info = $google_oauth->userinfo->get();
        
        $email = $google_account_info->email;
        $google_id = $google_account_info->id;

        // 1. CHECK USER
        $stmt = $conn->prepare("SELECT id, name, role, dept, google_id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // 2. LINK ID IF MISSING
            if (empty($user['google_id'])) {
                $update = $conn->prepare("UPDATE users SET google_id = ?, is_verified = 1 WHERE email = ?");
                $update->bind_param("ss", $google_id, $email);
                $update->execute();
            }

            // 3. GENERATE OTP
            $otp = rand(100000, 999999);
            $upd = $conn->prepare("UPDATE users SET otp_code = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?");
            $upd->bind_param("si", $otp, $user['id']);
            
            if ($upd->execute()) {
                // 4. SEND EMAIL
                $subject = "Login Verification Code";
                $body = "
                    <div style='font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 8px; max-width: 400px; margin: 0 auto;'>
                        <h2 style='color: #2563EB;'>Verification Required</h2>
                        <p>Use the code below to complete your login:</p>
                        <h1 style='background: #f1f5f9; display: inline-block; padding: 10px 20px; letter-spacing: 5px; color: #334155; border-radius: 6px;'>$otp</h1>
                        <p style='font-size: 12px; color: #64748b; margin-top: 20px;'>This code expires in 5 minutes.</p>
                    </div>
                ";
                
                sendNotificationEmail($email, $subject, $body);

                // 5. REDIRECT to Login Page with ?action=google_otp
                header("Location: ../../pages/login.html?action=google_otp&email=" . urlencode($email));
                exit;
            }

        } else {
            header("Location: ../../pages/login.html?error=" . urlencode("Email $email is not registered."));
            exit;
        }

    } catch (Exception $e) {
        header("Location: ../../pages/login.html?error=" . urlencode($e->getMessage()));
        exit;
    }
}
ob_end_flush();
?>