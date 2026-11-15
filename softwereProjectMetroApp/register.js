// --- Mock Database (For Duplicate Validation) ---
// In the next phase, Firebase will handle this.
const existingUsers = [
    "razan@gmail.com" // Mock existing email
];

// --- Form Submit Event ---
document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 1. Get Values
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const errorMsg = document.getElementById('register-error');
    const registerBtn = document.getElementById('register-btn');

    // Reset UI
    errorMsg.style.display = 'none';

    // --- AC Validation Logic ---

    // 1.Email Format Validation (Accepts any valid email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return showError("Invalid Email Format. Please enter a valid email address.");
    }
    // 2. Password Validation (Min 8, 1 Upper, 1 Lower, 1 Number, 1 Special)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return showError("Weak Password. Must include uppercase, lowercase, number, and special character (min 8 chars).");
    }
    // 3. Phone Number Validation (Starts with 0, exactly 10 digits)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
        return showError("Invalid Phone Number. Must start with 0 and be exactly 10 digits.");
    }
    // 4. Confirm Password Match
    if (password !== confirmPassword) {
        return showError("Passwords do not match. Please try again.");
    }

    // 5. Prevent Duplicate Emails Only
    if (existingUsers.includes(email)) {
        return showError("Registration failed: This email is already registered.");
    }

    // --- All Validations Passed! ---
    
    registerBtn.innerText = "Processing...";
    registerBtn.classList.add('disabled');

    // 6. AC: Hash Password Before Storing (Using Web Crypto API)
    const hashedPassword = await hashPassword(password);
    
 // --- in this sprint 1: UI Simulation ---
    // NOTE FOR EVALUATION: This simulates the database saving process.
    // In sprint 2, this block will be replaced with actual Firebase Authentication logic.
    setTimeout(() => {
        console.log("--- New User Registered ---");
        console.log("Full Name:", fullName);
        console.log("Email:", email);
        console.log("Phone:", phone);
        console.log("Hashed Password (Stored):", hashedPassword); 
        
        registerBtn.classList.remove('disabled');
        registerBtn.style.pointerEvents = "none";  
        registerBtn.innerText = "Account Created!";
        registerBtn.style.backgroundColor = "#28A745"; 
        registerBtn.style.color = "#ffffff";
        
        // Redirect to login page after success
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        
    }, 2000);

});

// --- Helper Functions ---

function showError(message) {
    const errorMsg = document.getElementById('register-error');
    errorMsg.innerText = message;
    errorMsg.style.display = 'block';
}

// Function to securely hash passwords (SHA-256)
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
