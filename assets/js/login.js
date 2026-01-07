/* assets/js/login.js */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Select DOM Elements
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passInput = document.getElementById("password");
    const loginBtn = document.getElementById("loginButton");
    const errorMsg = document.getElementById("error-message");

    // 2. Handle Form Submission
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent page refresh

        // A. Set UI to Loading State
        loginBtn.disabled = true;
        loginBtn.innerText = "Verifying...";
        errorMsg.style.display = 'none';

        // B. Simulate Network Delay (0.8s)
        setTimeout(() => {
            // Retrieve users from data.js
            const users = window.users || [];

            // C. Validate Credentials
            const validUser = users.find(user => 
                user.email === emailInput.value && 
                user.password === passInput.value
            );

            // D. Handle Result
            if (validUser) {
                // Success: Save Session & Redirect
                localStorage.setItem('currentUser', JSON.stringify(validUser));
                window.location.href = 'dashboard.html';
            } else {
                // Error: Show Alert & Reset Button
                errorMsg.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerText = "Sign In";
            }
        }, 800);
    });
});