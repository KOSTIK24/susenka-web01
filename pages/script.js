// ===== 🏆 Firebase Leaderboard =====

const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.firebaseio.com/",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Firebase inicializace
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function updateLeaderboardFirebase() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const username = localStorage.getItem("currentUser");
  if (!username || !users[username]) return;

  const score = users[username].cookies || 0;
  set(ref(db, "leaderboard/" + username), { name: username, cookies: score });
}db.ref("leaderboard/" + username).set({ name: username, cookies: score });


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

// 💎 ADMIN PANEL FUNKCE
window.addAdmin = function () {
  const username = document.getElementById("admin-name").value.trim();
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[username]) return alert("❌ Uživatel neexistuje!");
  users[username].role = "admin";
  localStorage.setItem("users", JSON.stringify(users));

  alert(`✅ ${username} byl povýšen na admina!`);
  window.listAdmins();
};

window.listAdmins = function () {
  const list = document.getElementById("admin-list");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  list.innerHTML = "";

  for (const [name, u] of Object.entries(users)) {
    if (u.role === "admin") {
      const li = document.createElement("li");
      li.textContent = `👑 ${name} (${u.email || "bez e-mailu"})`;
      list.appendChild(li);
    }
  }

  if (!list.innerHTML) list.innerHTML = "<li>Žádní admini zatím nejsou.</li>";
};

window.listUsers = function () {
  const list = document.getElementById("user-list");
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  list.innerHTML = "";
  if (!Object.keys(users).length) {
    list.innerHTML = "<li>Žádní uživatelé nejsou registrovaní.</li>";
    return;
  }

  for (const [name, u] of Object.entries(users)) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;background:rgba(255,255,255,.05);padding:6px 10px;border-radius:10px;">
        <img src="${u.avatar || 'images/susenka-logo.png'}" width="32" height="32" style="border-radius:50%;object-fit:cover;">
        <div>
          <strong>${name}</strong><br>
          <span style="font-size:13px;color:#ccc;">${u.email || "bez e-mailu"} • ${u.role || "člen"}</span>
        </div>
      </div>`;
    list.appendChild(li);
  }
};
