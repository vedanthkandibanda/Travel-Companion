import BASE_URL from "./config.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        console.log("LOGIN SUCCESS:", data);
        localStorage.setItem("userId", data.userId || data.user?._id || data.user?.id);
        localStorage.setItem("token", data.token);
        
        alert("Login successful 🚀");
        window.location.href = "dashboard.html"; 
    } else {
        alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});