import BASE_URL from "./config.js";

const form = document.getElementById(document.querySelector('form').id);

function showVoyaToast(message, type = "success") {
    let toast = document.getElementById("v-toast");
    if(!toast) {
        toast = document.createElement("div");
        toast.id = "v-toast";
        toast.className = "v-toast";
        document.body.appendChild(toast);
    }
    toast.innerHTML = (type === "success" ? "🚀 " : "⚠️ ") + message;
    toast.className = `v-toast show ${type}`;
    setTimeout(() => { toast.className = "v-toast"; }, 3000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Custom Validation logic
    let isValid = true;
    const inputs = form.querySelectorAll("input[required]");
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add("invalid");
            isValid = false;
        } else {
            input.classList.remove("invalid");
        }
    });

    if (!isValid) {
        showVoyaToast("Please fill in all fields", "error");
        return;
    }

    // Auth Logic
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const name = document.getElementById("name")?.value.trim(); // Only for register

    try {
        const route = name ? "register" : "login";
        const res = await fetch(`${BASE_URL}/auth/${route}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showVoyaToast(name ? "Account Created! Welcome." : "Login Successful! ✈️", "success");
            if (!name) {
                localStorage.setItem("userId", data.userId || data.user?.id);
                localStorage.setItem("token", data.token);
            }
            setTimeout(() => {
              // Inside your login.js submit handler:
if (response.ok) {
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("token", data.token);
    
    // Check if user needs to set up their profile
    if (data.user.profile_completed) {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "setup-profile.html"; 
    }
}
                window.location.href = name ? "login.html" : "dashboard.html";
            }, 1500);
        } else {
            showVoyaToast(data.message || "Something went wrong", "error");
        }
    } catch (err) {
        showVoyaToast("Server Error", "error");
    }
});

// For Login Page Reset Button
window.handleReset = () => {
    const email = document.getElementById("resetEmail").value;
    if(!email) return showVoyaToast("Enter email first", "error");
    showVoyaToast("Reset link sent! Check your inbox 📧", "success");
    setTimeout(() => document.getElementById('forgotModal').style.display='none', 2000);
}