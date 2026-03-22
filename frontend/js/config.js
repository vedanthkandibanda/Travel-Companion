// config.js
const BASE_URL = "https://travel-companion-y8fn.onrender.com/api";
// Ensure this only runs if io is defined
const socket = typeof io !== 'undefined' ? io("https://travel-companion-y8fn.onrender.com") : null;

export default BASE_URL;