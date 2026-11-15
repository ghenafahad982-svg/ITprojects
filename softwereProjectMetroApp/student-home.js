

// 1. Mock Data (To be replaced by Firebase data in Phase 4)
const mockBuses = [
    { id: 101, number: "B-101", capacity: 30, reserved: 15, eta: "08:00 AM", status: "Active" },
    { id: 102, number: "B-102", capacity: 30, reserved: 30, eta: "08:15 AM", status: "Active" }, // Full bus
    { id: 103, number: "B-103", capacity: 30, reserved: 29, eta: "08:30 AM", status: "Active" }, // 1 seat left
    { id: 104, number: "B-104", capacity: 30, reserved: 5, eta: "09:00 AM", status: "Inactive" } // Inactive bus
];

const mockStudentProfile = {
    fullName: "Gharsah Almusaeed",
    phoneNumber: "0556720056",
    email: "gharsah@student.ksu.edu.sa"
};

// State Variables
let studentHasReservation = false; 
let selectedBusId = null;

// ==========================================================
// 2. Profile Page Logic (Dynamic Rendering, Editing & Validation)
// ==========================================================
const profileDataContainer = document.getElementById('profileDataContainer');

if (profileDataContainer) {
    function renderProfile() {
        profileDataContainer.innerHTML = `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="profileName" value="${mockStudentProfile.fullName}" disabled>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="profilePhone" value="${mockStudentProfile.phoneNumber}" disabled>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="profileEmail" value="${mockStudentProfile.email}" disabled>
            </div>
            <button id="editProfileBtn" class="btn btn-primary mt-3">Edit Profile</button>
        `;

        const editBtn = document.getElementById('editProfileBtn');
        const nameInput = document.getElementById('profileName');
        const phoneInput = document.getElementById('profilePhone');
        const emailInput = document.getElementById('profileEmail');

        editBtn.addEventListener('click', function() {
            if (editBtn.innerText === "Edit Profile") {
                // فتح الحقول للتعديل
                nameInput.disabled = false;
                phoneInput.disabled = false;
                emailInput.disabled = false;
                nameInput.focus();
                
                // تغيير شكل الزر
                editBtn.innerText = "Save Changes";
                editBtn.style.backgroundColor = "var(--success-green)";
                editBtn.style.color = "white";
            } else {
                //  Validation (التحقق من المدخلات) 
                const nameVal = nameInput.value.trim();
                const phoneVal = phoneInput.value.trim();
                const emailVal = emailInput.value.trim();

                // 1. تحقق الاسم (حروف عربية أو إنجليزية ومسافات فقط)
                const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
                if (!nameRegex.test(nameVal)) {
                    alert("Invalid Name: Please enter letters only (no numbers or symbols).");
                    return; // إيقاف العملية وعدم الحفظ
                }

                // 2. تحقق رقم الجوال (يبدأ بـ 05 ومكون من 10 أرقام)
                const phoneRegex = /^05\d{8}$/;
                if (!phoneRegex.test(phoneVal)) {
                    alert("Invalid Phone Number: It must start with '05' and be exactly 10 digits long.");
                    return; // إيقاف العملية
                }

                // 3. تحقق الإيميل (صيغة صحيحة)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailVal)) {
                    alert("Invalid Email: Please enter a valid email address format.");
                    return; // إيقاف العملية
                }
                // --- نهاية الـ Validation ---

                // إذا اجتازت المدخلات كل الشروط، يتم الحفظ:
                mockStudentProfile.fullName = nameVal;
                mockStudentProfile.phoneNumber = phoneVal;
                mockStudentProfile.email = emailVal;
                
                // إغلاق الحقول مجدداً
                nameInput.disabled = true;
                phoneInput.disabled = true;
                emailInput.disabled = true;
                
                // إرجاع الزر لشكله الأصلي
                editBtn.innerText = "Edit Profile";
                editBtn.style.backgroundColor = "";
                
                alert("Profile updated successfully!"); 
            }
        });
    }
    
    renderProfile();
}

// ==========================================================
// 3. Home / Search Page Logic
// ==========================================================
const searchBtn = document.getElementById('searchBtn');
const destinationSelect = document.getElementById('destinationSelect'); 
const resultsSection = document.getElementById('resultsSection');
const busListContainer = document.getElementById('busList');

// تفعيل زر البحث فقط إذا تم اختيار وجهة من المنيو
if (destinationSelect && searchBtn) {
    destinationSelect.addEventListener('change', () => {
        if (destinationSelect.value !== "") {
            searchBtn.disabled = false;
            searchBtn.classList.remove('disabled');
        } else {
            searchBtn.disabled = true;
            searchBtn.classList.add('disabled');
        }
    });
}

// Search and Render Buses
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        busListContainer.innerHTML = ''; 
        
        const activeBuses = mockBuses.filter(bus => bus.status === "Active");

        if(activeBuses.length === 0) {
            busListContainer.innerHTML = '<p style="color: var(--text-muted);">No active trips found.</p>';
        } else {
            activeBuses.forEach(bus => {
                const availableSeats = bus.capacity - bus.reserved;
                const isFull = availableSeats <= 0;
                
                const card = document.createElement('div');
                card.className = 'trip-card'; 
                
                card.innerHTML = `
                    <div class="bus-card-flex">
                        <div class="bus-details">
                            <h3>Bus: ${bus.number}</h3>
                            <p><strong>ETA:</strong> ${bus.eta}</p>
                            <p><strong>Capacity:</strong> ${isFull ? '<span class="full-badge">Full</span>' : `${availableSeats}/${bus.capacity} seats available`}</p>
                        </div>
                        <button class="btn btn-primary ${isFull ? 'disabled' : ''}" onclick="openReservationModal(${bus.id})">
                            ${isFull ? 'Full' : 'Reserve'}
                        </button>
                    </div>
                `;
                busListContainer.appendChild(card);
            });
        }
        resultsSection.classList.remove('hidden');
    });
}

// ==========================================================
// 4. Modal & Reservation Logic
// ==========================================================
const reservationModal = document.getElementById('reservationModal');
const tripDetailsBox = document.getElementById('tripDetails');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');

window.openReservationModal = function(busId) {
    if(studentHasReservation) {
        alert("You have already reserved a seat for a trip. You cannot reserve multiple seats at the same time.");
        return;
    }
    
    selectedBusId = busId;
    const bus = mockBuses.find(b => b.id === busId);
    
    tripDetailsBox.innerHTML = `
        <p><strong>Bus Number:</strong> ${bus.number}</p>
        <p><strong>Departure Time:</strong> ${bus.eta}</p>
    `;
    
    reservationModal.style.display = 'flex'; 
};

// Close Modal
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        reservationModal.style.display = 'none';
        selectedBusId = null;
    });
}

// Confirm Reservation
if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
        const busIndex = mockBuses.findIndex(b => b.id === selectedBusId);
        const bus = mockBuses[busIndex];

        if (bus.capacity - bus.reserved <= 0) {
            alert("Seat no longer available. Please choose another bus/time."); 
            reservationModal.style.display = 'none';
            searchBtn.click(); 
            return;
        }

        bus.reserved += 1;
        studentHasReservation = true;
        
        const reservationId = "RES-" + Math.floor(Math.random() * 100000);
        console.log(`[DB Mock] Reservation Saved. ID: ${reservationId}, Time: ${new Date().toLocaleString()}`);
        
        alert(`Reservation Confirmed successfully!\nID: ${reservationId}`);
        reservationModal.style.display = 'none';
        
        // حفظ بيانات الحجز والانتقال للصفحة
        const reservation = {
            reservationId: reservationId,
            busNumber: bus.number,
            time: bus.eta,
            status: "Active"
        };

        localStorage.setItem("myReservation", JSON.stringify(reservation));

        window.location.href = "my_reservations.html";

        // تحديث الواجهة (في حال لم يتم الانتقال لسبب ما)
        searchBtn.click();
    });
}

// ==========================================================
// 5. Logout Logic 
// ==========================================================
const logoutBtns = document.querySelectorAll('.logout-btn');
logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert("You have been logged out securely.");
        window.location.href = "login.html"; 
    });
});
