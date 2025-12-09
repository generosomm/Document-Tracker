/* * script.js
 * Global logic that runs on every page
 * (Sidebar toggles, Header User Dropdown, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Example: User Profile Dropdown Toggle
    // (If you want to make the user profile click show a menu later)
    const userProfile = document.querySelector('.user-profile');
    
    if(userProfile) {
        userProfile.addEventListener('click', () => {
            // Logic to toggle a dropdown menu could go here
            console.log("User profile clicked");
        });
    }

    // Example: Mobile Menu Toggle
    // (If you add a hamburger menu for mobile later)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navbar = document.querySelector('.navbar');

    if(mobileMenuBtn && navbar) {
        mobileMenuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

});