import BASE_URL from "./config.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    // Replace lines 24-31 with this:
if (response.ok) {
    console.log("LOGIN SUCCESS:", data);
    
    // Use the actual keys your backend sends (usually userId and token)
    localStorage.setItem("userId", data.userId || data.user?._id || data.user?.id);
    localStorage.setItem("token", data.token);
    
    alert("Login successful 🚀");
    window.location.href = "dashboard.html"; 
} else {
    console.error("LOGIN FAILED:", data);
    alert(data.message || "Login failed. Please check your credentials.");
}

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});