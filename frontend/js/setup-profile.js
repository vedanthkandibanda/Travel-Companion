import BASE_URL from "./config.js";

const interestsList = [
    "Adventure", "Solo Travel", "Foodie", "Photography", "Hiking", "Beach Life", 
    "Museums", "Nightlife", "Budget Travel", "Luxury", "Backpacking", "Cruising",
    "History", "Art", "Yoga", "Camping", "Road Trips", "Festivals", "Nature",
    "Surfing", "Skiing", "Digital Nomad", "Local Life", "Sustainability", "Wildlife"
];

let selectedInterests = [];

// Populate Interests
const grid = document.getElementById('interestsGrid');
interestsList.forEach(item => {
    const span = document.createElement('span');
    span.className = 'interest-tag';
    span.innerText = item;
    span.onclick = () => {
        span.classList.toggle('selected');
        if(selectedInterests.includes(item)) {
            selectedInterests = selectedInterests.filter(i => i !== item);
        } else {
            selectedInterests.push(item);
        }
    };
    grid.appendChild(span);
});

// UI Navigation
window.nextStep = () => {
    const name = document.getElementById('setupName').value;
    if(!name) return alert("Please enter your name");
    
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('stepSub').innerText = 'Step 2 of 2 — Interests';
};

// Final API Call
window.finishSetup = async () => {
    if(selectedInterests.length < 3) return alert("Please select at least 3 interests!");

    const token = localStorage.getItem("token");
    const profileData = {
        fullName: document.getElementById('setupName').value,
        username: document.getElementById('setupUser').value,
        bio: document.getElementById('setupBio').value,
        interests: selectedInterests
    };

    try {
        const res = await fetch(`${BASE_URL}/auth/setup-profile`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(profileData)
        });

        const data = await res.json();
        if(res.ok) {
            alert("Welcome to VoyaMate! ✈️");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Error saving profile");
        }
    } catch (err) {
        console.error(err);
        alert("Server connection failed");
    }
};