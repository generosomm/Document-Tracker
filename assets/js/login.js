document.addEventListener("DOMContentLoaded", () => {
    const PHP_RUNTIME_ERROR = "The PHP API is not running. Open this project through XAMPP/Apache, for example http://localhost/Document-Tracker/pages/login.html, not the Live Server :5500 URL.";
    const isLiveServer = window.location.port === "5500";

    function ensurePhpRuntime() {
        if (isLiveServer) {
            throw new Error(PHP_RUNTIME_ERROR);
        }
    }

    async function readJsonResponse(response) {
        const rawText = await response.text();

        if (!rawText.trim()) {
            if (response.status === 405 || window.location.port === "5500") {
                throw new Error(PHP_RUNTIME_ERROR);
            }

            throw new Error(`Empty response from server (${response.status})`);
        }

        try {
            return JSON.parse(rawText);
        } catch (error) {
            if (response.status === 405 || window.location.port === "5500") {
                throw new Error(PHP_RUNTIME_ERROR);
            }

            throw new Error(`Server returned an invalid response (${response.status})`);
        }
    }

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginButton");
    const loginErrorMsg = document.getElementById("login-error-message");

    const otpContainer = document.getElementById("otp-container");
    const otpInput = document.getElementById("otp-input");
    const verifyBtn = document.getElementById("verifyOtpBtn");
    const otpErrorMsg = document.getElementById("otp-error-message");

    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('action') === 'google_otp' && urlParams.get('email')) {
        const googleEmail = urlParams.get('email');
        
        console.log("Google Login Detected:", googleEmail);

        localStorage.setItem('temp_email', googleEmail);
        
        if (loginForm) loginForm.style.display = 'none';
        if (otpContainer) otpContainer.style.display = 'block';
        if (otpInput) otpInput.focus();
        
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.has('error')) {
        if (loginErrorMsg) {
            loginErrorMsg.innerText = urlParams.get('error');
            loginErrorMsg.style.display = 'block';
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();

            loginBtn.disabled = true;
            loginBtn.innerText = "Verifying...";
            loginErrorMsg.style.display = 'none';

            const email = emailInput.value.trim();
            const password = passInput.value.trim();

            try {
                ensurePhpRuntime();

                const response = await fetch('../assets/api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await readJsonResponse(response);

                if (data.success) {
                    if (data.require_otp) {
                        localStorage.setItem('temp_email', data.email);
                        
                        loginForm.style.display = 'none';
                        otpContainer.style.display = 'block';
                        otpInput.focus();
                    } else {
                        localStorage.setItem('currentUser', JSON.stringify(data.user));
                        loginBtn.innerText = "Success! Redirecting...";
                        setTimeout(() => { 
                            window.location.href = 'dashboard.html'; 
                        }, 500);
                    }
                } else {
                    throw new Error(data.message || "Invalid credentials");
                }

            } catch (error) {
                console.error("Login Error:", error);
                loginErrorMsg.innerText = error.message;
                loginErrorMsg.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerText = "Sign In";
            }
        });
    }

    if (verifyBtn) {
        verifyBtn.addEventListener("click", async function() {
            const otp = otpInput.value.trim();
            const email = localStorage.getItem('temp_email');

            if (!otp) {
                otpErrorMsg.innerText = "Please enter the code.";
                otpErrorMsg.style.display = 'block';
                return;
            }

            verifyBtn.disabled = true;
            verifyBtn.innerText = "Verifying...";
            otpErrorMsg.style.display = 'none';

            try {
                ensurePhpRuntime();

                const response = await fetch('../assets/api/verify_otp.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });

                const data = await readJsonResponse(response);

                if (data.success) {
                    localStorage.removeItem('temp_email');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    
                    verifyBtn.innerText = "Verified! Redirecting...";
                    setTimeout(() => { 
                        window.location.href = 'dashboard.html'; 
                    }, 500);
                } else {
                    throw new Error(data.message || "Invalid or Expired Code");
                }

            } catch (error) {
                console.error("OTP Error:", error);
                otpErrorMsg.innerText = error.message;
                otpErrorMsg.style.display = 'block';
                verifyBtn.disabled = false;
                verifyBtn.innerText = "Verify Code";
            }
        });
    }
});
