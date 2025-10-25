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

/* ===== 💎 ADMIN PANEL – GLOBÁLNÍ FUNKCE ===== */
(function adminGlobals(){
  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("admin-panel");
    if (!panel) return;
    const current = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const u = current ? users[current] : null;
    if (u && (u.role === "vedouci" || u.role === "admin" || (u.email||"").toLowerCase()==="susenky17@gmail.com")) {
      panel.style.display = "block";
    }
  });

  window.addAdmin = function () {
    const input = document.getElementById("admin-name");
    const username = (input?.value || "").trim();
    if (!username) return alert("Zadej jméno.");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[username]) return alert("❌ Uživatel neexistuje.");
    users[username].role = "admin";
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Povýšen na admina: " + username);
    window.listAdmins();
  };

  window.listAdmins = function () {
    const list = document.getElementById("admin-list");
    if (!list) return;
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    list.innerHTML = "";
    const admins = Object.entries(users).filter(([_,u]) => u.role==="admin" || u.role==="vedouci");
    if (!admins.length) { list.innerHTML = "<li>Žádní admini.</li>"; return; }
    admins.forEach(([name,u])=>{
      const li = document.createElement("li");
      li.textContent = `👑 ${name} • ${u.role}`;
      list.appendChild(li);
    });
  };

  window.giveCookies = function () {
    const current = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!current || !users[current]) return alert("Nikdo není přihlášen.");
    users[current].cookies = (users[current].cookies||0) + 1000;
    localStorage.setItem("users", JSON.stringify(users));
    alert("🍪 +1000 sušenek");
  };

  window.clearUsers = function () {
    if (!confirm("Smazat všechny účty?")) return;
    localStorage.removeItem("users");
    localStorage.removeItem("currentUser");
    alert("🧹 Smazáno.");
    location.reload();
  };

  window.listUsers = function () {
    const list = document.getElementById("user-list");
    if (!list) return;
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    list.innerHTML = "";
    if (!Object.keys(users).length) { list.innerHTML = "<li>Žádní uživatelé.</li>"; return; }
    for (const [name,u] of Object.entries(users)) {
      const li = document.createElement("li");
      li.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;background:rgba(255,255,255,.05);padding:6px 10px;border-radius:10px;">
        <img src="${u.avatar || 'images/susenka-logo.png'}" width="32" height="32" style="border-radius:50%;object-fit:cover;">
        <div><strong>${name}</strong><br><span style="font-size:13px;color:#ccc;">${u.email || "bez e-mailu"} • ${u.role || "člen"}</span></div>
      </div>`;
      list.appendChild(li);
    }
  };
})();