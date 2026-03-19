const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.userId) {
    localStorage.setItem("userId", data.userId);

    alert("Login successful 🚀");

    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});