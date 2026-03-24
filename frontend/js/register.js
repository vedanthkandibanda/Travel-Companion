import BASE_URL from "./config.js";

const form = document.getElementById("registerForm");
const alertBox = document.getElementById("customAlert");
const alertMsg = document.getElementById("alertMsg");

function showToast(msg, isSuccess = true) {
    alertMsg.innerText = msg;
    alertBox.style.display = "block";
    alertBox.style.borderLeft = isSuccess ? "5px solid #10b981" : "5px solid #ef4444";
    setTimeout(() => { alertBox.style.display = "none"; }, 3000);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Account created successfully! 🚀");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            showToast(data.message || "Registration failed", false);
        }

    } catch (err) {
        console.error(err);
        showToast("Server connection error", false);
    }
});