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