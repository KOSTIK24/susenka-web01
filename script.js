// ===== 🏆 Firebase Leaderboard =====
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.firebaseio.com/",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

function updateLeaderboardFirebase() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const username = localStorage.getItem("currentUser");
  if (!username || !users[username]) return;

  const score = users[username].cookies || 0;
  set(ref(db, "leaderboard/" + username), { name: username, cookies: score });
}

// Poslouchání leaderboardu a zobrazení
const leaderboardEl = document.getElementById("leaderboard");
if (leaderboardEl) {
  onValue(ref(db, "leaderboard"), (snapshot) => {
    const data = [];
    snapshot.forEach((child) => data.push(child.val()));
    data.sort((a, b) => b.cookies - a.cookies);

    leaderboardEl.innerHTML = "";
    data.forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `#${i + 1} ${p.name} <span>${p.cookies} 🍪</span>`;
      leaderboardEl.appendChild(li);
    });
  });
}
