import BASE_URL from "./config.js";

// Global Logout function
window.logout = function() {
    localStorage.clear();
    window.location.href = "login.html";
};

async function loadNotifications() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
        const res = await fetch(`${BASE_URL}/flights/unread/${userId}`);
        const data = await res.json();
        
        const countElement = document.getElementById("notifCount");
        if (countElement) {
            countElement.innerText = data.count || 0;
            // Hide badge if count is 0
            countElement.style.display = data.count > 0 ? "block" : "none";
        }
    } catch (err) {
        console.error("Notification Fetch Error:", err);
    }
}

// Check for profile data if needed
async function checkProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
}

// Initialize
checkProfile();
setInterval(loadNotifications, 5000);
loadNotifications();