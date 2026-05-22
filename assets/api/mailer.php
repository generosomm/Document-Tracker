<?php
// assets/api/mailer.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Adjust path if needed based on your folder structure
require_once __DIR__ . '/../../vendor/autoload.php';

// Added &$errorDebug parameter to capture the specific error message
function sendNotificationEmail($toEmail, $subject, $messageBody, &$errorDebug = null) {
    $mail = new PHPMailer(true);

    try {
        $mail->CharSet = 'UTF-8';
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        
        // Extract credentials from environment variables or use fallback
        $mail->Username   = $_ENV['SMTP_USER'] ?? 'generosomerwin10@gmail.com';
        $mail->Password   = $_ENV['SMTP_PASS'] ?? 'rwic lled mopr xnlb'; 
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // --- FIX FOR LOCALHOST / XAMPP SSL ISSUES ---
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        // --------------------------------------------

        $mail->setFrom('generosomerwin1010@gmail.com', 'DTS Admin');
        $mail->addAddress($toEmail);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $messageBody;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Capture the specific error from PHPMailer
        $errorDebug = $mail->ErrorInfo;
        error_log("Mail Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>