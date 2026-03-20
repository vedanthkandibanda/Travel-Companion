const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("https://travel-companion-y8fn.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data); // 🔥 DEBUG

    // ✅ HANDLE BOTH POSSIBLE FORMATS
    const userId = data.user?.id || data.userId;

    if (userId) {
      localStorage.setItem("userId", userId);

      alert("Login successful 🚀");
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error during login");
  }
});