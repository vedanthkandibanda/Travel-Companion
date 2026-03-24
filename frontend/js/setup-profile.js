const interests = [
    "Startups", "AI", "Photography", "Hiking", "Coffee", "Music", "Travel", "Cooking", "Art", 
    "Reading", "Surfing", "Yoga", "Gaming", "Sports", "Design", "Cricket", "Movies", "Tech",
    "History", "Fitness", "Coding", "Fashion", "Gaming", "Dancing", "Business", "Nature", "Pets"
];

let selectedInterests = [];

// Initialize Interests
const grid = document.getElementById('interestsGrid');
interests.forEach(item => {
    const div = document.createElement('div');
    div.className = 'interest-tag';
    div.innerText = item;
    div.onclick = () => {
        div.classList.toggle('selected');
        if(selectedInterests.includes(item)) {
            selectedInterests = selectedInterests.filter(i => i !== item);
        } else {
            selectedInterests.push(item);
        }
    };
    grid.appendChild(div);
});

window.goToStep = (step) => {
    if(step === 2) {
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('progressFill').style.width = '100%';
        document.getElementById('stepSub').innerText = 'Step 2 of 2 — Interests';
    }
};

window.finishSetup = async () => {
    const profileData = {
        fullName: document.getElementById('setupName').value,
        username: document.getElementById('setupUser').value,
        bio: document.getElementById('setupBio').value,
        interests: selectedInterests
    };

    // Replace with your API call
    console.log("Saving Profile:", profileData);
    alert("Profile Setup Complete! ✈️");
    window.location.href = 'dashboard.html';
};