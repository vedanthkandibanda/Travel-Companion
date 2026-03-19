async function getProfile() {

const token = localStorage.getItem("token");

const response = await fetch("http://localhost:5000/api/auth/profile", {
method: "GET",
headers: {
Authorization: "Bearer " + token
}
});

const data = await response.json();

document.getElementById("result").innerText = data.message;

}

function logout() {
localStorage.removeItem("token");
window.location.href = "login.html";
}

async function loadNotifications(){

  const userId = localStorage.getItem("userId")

  const res = await fetch(`http://localhost:5000/api/flights/unread/${userId}`)
  const data = await res.json()

  document.getElementById("notifCount").innerText = data.count
}

setInterval(loadNotifications, 5000)
loadNotifications()