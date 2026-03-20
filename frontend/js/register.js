import BASE_URL from "./config.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("input[type='text']").value.trim();
  const email = document.querySelector("input[type='email']").value.trim();
  const password = document.querySelector("input[type='password']").value.trim();

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    alert(data.message || "Registered ✅");

    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("Error registering");
  }
});