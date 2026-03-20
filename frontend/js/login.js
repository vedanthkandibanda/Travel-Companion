import BASE_URL from "./config.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    if (data.user?.id) {
      // ✅ store everything needed
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("token", data.token);

      alert("Login successful 🚀");
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});