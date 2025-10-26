// ========== 🍪 SUŠENKA WEB – SCRIPT ========== //
console.log("✅ Sušenka Web – hlavní skript načten");

// === Pomocné funkce ===
const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const setCurrentUser = (n) => localStorage.setItem("currentUser", n);
const getCurrentUser = () => localStorage.getItem("currentUser");
const hashPass = (s) => btoa(unescape(encodeURIComponent(s)));

document.addEventListener("DOMContentLoaded", () => {
  initGame();
  initLeaderboard(); // ✅ Přidáno
});

// === HRA ===
function initGame() {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  if (!cookie || !countDisplay) return;

  const tools = [
    { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
    { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
    { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
    { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
  ];

  const username = getCurrentUser();
  const users = loadUsers();
  if (!users[username]) {
    users[username] = { cookies: 0, inventory: [], role: "clen" };
    saveUsers(users);
  }

  let count = users[username].cookies || 0;
  let inventory = users[username].inventory || [];

  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  function updateDisplay() {
    countDisplay.textContent = count;
  }

  function getBonus() {
    return inventory.reduce((s, id) => {
      const t = tools.find(x => x.id === id);
      return s + (t ? t.bonus : 0);
    }, 0);
  }

  function saveGame() {
    users[username].cookies = count;
    users[username].inventory = inventory;
    saveUsers(users);
    updateLeaderboardFirebase(); // ✅ Ukládá i do Firebase
  }

  function buyTool(tool) {
    if (inventory.includes(tool.id)) return;
    if (count < tool.cost) return alert("❌ Máš málo sušenek!");
    count -= tool.cost;
    inventory.push(tool.id);
    saveGame();
    updateDisplay();
    renderInventory();
    renderShop();
  }

  function renderShop() {
    shop.innerHTML = "";
    tools.forEach((t) => {
      const owned = inventory.includes(t.id);
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = owned ? "✅ Vlastníš" : `🛒 Koupit (${t.cost})`;
      btn.disabled = owned;
      btn.onclick = () => buyTool(t);
      shop.appendChild(btn);
    });
  }

  function renderInventory() {
    inventoryList.innerHTML = "";
    if (!inventory.length) {
      inventoryList.innerHTML = "<li>Nemáš žádné nástroje.</li>";
      return;
    }
    inventory.forEach((id) => {
      const t = tools.find((x) => x.id === id);
      const li = document.createElement("li");
      li.textContent = `${t.name} • +${t.bonus} 🍪/klik`;
      inventoryList.appendChild(li);
    });
  }

  cookie.addEventListener("click", () => {
    count += 1 + getBonus();
    cookie.style.transform = "scale(0.9)";
    setTimeout(() => (cookie.style.transform = ""), 100);
    updateDisplay();
    saveGame();
  });

  updateDisplay();
  renderShop();
  renderInventory();
}

// ===== 🏆 Firebase Leaderboard =====
const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app", // ✅ správný region
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// 🧠 Firebase inicializace
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 🔍 Debug připojení
firebase.database().ref(".info/connected").on("value", (snap) => {
  if (snap.val() === true) {
    console.log("✅ Připojeno k Firebase Realtime Database");
  } else {
    console.warn("⚠️ Nepřipojeno k Firebase!");
  }
});

// 💾 Ulož skóre do Firebase
function updateLeaderboardFirebase() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const username = localStorage.getItem("currentUser");
  if (!username || !users[username]) {
    console.warn("⚠️ Nelze odeslat do Firebase – žádný uživatel přihlášen!");
    return;
  }

  const score = users[username].cookies || 0;
  console.log("🔥 Pokus o zápis do Firebase:", username, score);

  db.ref("leaderboard/" + username)
    .set({ name: username, cookies: score })
    .then(() => console.log("✅ Úspěšně uloženo do Firebase!"))
    .catch((err) => console.error("❌ Chyba při zápisu do Firebase:", err));
}

// 🏁 Načti leaderboard po načtení stránky
function initLeaderboard() {
  const leaderboardEl = document.getElementById("leaderboard");
  if (!leaderboardEl) {
    console.warn("⚠️ Element #leaderboard nebyl nalezen");
    return;
  }

  db.ref("leaderboard").on("value", (snapshot) => {
    const data = [];
    snapshot.forEach((child) => data.push(child.val()));
    data.sort((a, b) => b.cookies - a.cookies);

    leaderboardEl.innerHTML = "";
    if (!data.length) {
      leaderboardEl.innerHTML = "<li>Žádní hráči zatím nejsou.</li>";
      return;
    }

    data.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
      const li = document.createElement("li");
      li.innerHTML = `${medal} #${i + 1} ${p.name} <span>${p.cookies} 🍪</span>`;
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
