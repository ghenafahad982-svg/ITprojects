// --- 1. Tab Switching Logic ---
function switchTab(role) {
    // Remove 'active' class from both tab buttons
    document.getElementById('tab-student').classList.remove('active');
    document.getElementById('tab-admin').classList.remove('active');
    // Add 'active' class to the clicked tab button
    document.getElementById(`tab-${role}`).classList.add('active');

    // Remove 'active' class from both form sections to hide them
    document.getElementById('student-section').classList.remove('active');
    document.getElementById('admin-section').classList.remove('active');
    // Add 'active' class to the selected form section to show it
    document.getElementById(`${role}-section`).classList.add('active');
}

// --- 2. Student Login Logic ---
document.getElementById('student-login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('student-email').value.trim();
    const password = document.getElementById('student-password').value;
    const errorMsg = document.getElementById('student-error');

    // Reset error message
    errorMsg.style.display = 'none'; 

    // Check for empty fields
    if (!email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        errorMsg.style.display = 'block';
        return;
    }

    // Mock successful login for frontend phase
    alert("Student login successful!");
    window.location.href = "student-home.html"; // Redirect to student home
});

// --- 3. Administrator Login Logic ---
document.getElementById('admin-login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const loginBtn = document.getElementById('admin-btn');
    const errorMsg = document.getElementById('admin-error');

    // Reset UI State
    errorMsg.style.display = 'none';
    loginBtn.innerText = "Authenticating...";
    loginBtn.classList.add('disabled');

    // Mock Admin Database
    const adminDB = {
        "admin@ksu.edu.sa": "Admin123"
    };

    // Simulate Network Delay
    setTimeout(() => {
        // AC: Unregistered email
        if (!adminDB.hasOwnProperty(email)) {
            showAdminError("Login failed: Unregistered email address.\nhint for Supervisor : use this email ( admin@ksu.edu.sa ) and password ( Admin123 )");    
        } 
        // AC: Incorrect password
        else if (adminDB[email] !== password) {
           showAdminError("Login failed: Unregistered email address.\nhint for Supervisor : use this email ( admin@ksu.edu.sa ) and password ( Admin123 )");
        } 
      
       // AC: Successful login
        else {
            loginBtn.classList.remove('disabled'); 
            loginBtn.style.pointerEvents = "none";
            loginBtn.innerText = "Success!";
            loginBtn.style.backgroundColor = "#28A745"; 
            loginBtn.style.color = "#ffffff";
           
            setTimeout(() => {
           window.location.href = "admin.html";
        }, 1500);
          
        }
    }, 3000);

      
    // Helper for Admin Errors
    function showAdminError(message) {
        errorMsg.innerText = message;
        errorMsg.style.display = 'block';
        loginBtn.innerText = "Admin Log In";
        loginBtn.classList.remove('disabled');
    }
});

// --- 4. Forgot Password Logic (Mock Phase) ---
const forgotPwdLink = document.getElementById('forgot-password-link');
const forgotPwdModal = document.getElementById('forgot-password-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const forgotPwdForm = document.getElementById('forgot-password-form');
const resetMessage = document.getElementById('reset-message');

// Open modal when the "Forgot Password?" link is clicked
forgotPwdLink.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    forgotPwdModal.style.display = 'flex'; // Show the modal
    resetMessage.style.display = 'none'; // Hide any previous messages
    document.getElementById('reset-email').value = ''; // Clear the email input field
});

// Close modal when the "Cancel" button is clicked
closeModalBtn.addEventListener('click', function() {
    forgotPwdModal.style.display = 'none';
});


// Mock sending the password reset request
forgotPwdForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const resetEmail = document.getElementById('reset-email').value.trim();
    
    if (resetEmail) {
        // Generic message to mock the "Email Enumeration Protection" feature
        resetMessage.style.color = "#28A745"; // Success green color
        resetMessage.innerText = "If this email is registered, you will receive a reset link shortly.";
        resetMessage.style.display = "block";
        
        
        setTimeout(() => {
            forgotPwdModal.style.display = 'none';
            resetMessage.style.display = 'none';
        }, 5000);
    }
});
