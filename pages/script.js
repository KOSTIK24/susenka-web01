// ========== 🍪 SUŠENKA WEB – SCRIPT ========== //
console.log("✅ Sušenka Web – hlavní skript načten");

// === Pomocné funkce ===
const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const setCurrentUser = (n) => localStorage.setItem("currentUser", n);
const getCurrentUser = () => localStorage.getItem("currentUser");
const hashPass = (s) => btoa(unescape(encodeURIComponent(s)));

// === LOGIN A REGISTRACE ===
document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");

  if (btnLogin) {
    btnLogin.onclick = () => {
      const name = document.getElementById("login-name").value.trim();
      const pass = document.getElementById("login-pass").value.trim();
      const users = loadUsers();
      if (!users[name]) return alert("❌ Uživatel neexistuje!");
      if (users[name].pass !== hashPass(pass)) return alert("❌ Špatné heslo!");
      setCurrentUser(name);
      alert("✅ Přihlášeno");
      location.href = "../index.html";
    };
  }

  if (btnRegister) {
    btnRegister.onclick = () => {
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const pass = document.getElementById("reg-pass").value.trim();
      const avatar = document.getElementById("reg-avatar").value.trim();
      if (!name || !email || !pass) return alert("Vyplň vše!");

      const users = loadUsers();
      if (users[name]) return alert("Uživatel už existuje!");

      const isLeader = email === "susenky17@gmail.com";
      users[name] = {
        pass: hashPass(pass),
        email,
        avatar: avatar || "images/susenka-logo.png",
        role: isLeader ? "vedouci" : "clen",
        cookies: 0,
        inventory: []
      };
      saveUsers(users);
      setCurrentUser(name);
      alert(isLeader ? "💎 Vítej, Vedoucí!" : "✅ Registrace hotová!");
      location.href = "../index.html";
    };
  }

  initGame();
});

// === HRA ===
function initGame() {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  if (!cookie || !countDisplay) return;

  const tools = [
    { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
    { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
    { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
    { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
  ];

  const username = getCurrentUser();
  const users = loadUsers();
  const user = users[username] || { cookies: 0, inventory: [] };
  let count = parseInt(user.cookies || 0);
  let inventory = user.inventory || [];

  updateDisplay();
  renderShop();
  renderInventory();

  cookie.addEventListener("click", () => {
    count += 1 + getBonus();
    animateCookie();
    updateDisplay();
    saveGame();
  });

  saveBtn?.addEventListener("click", () => {
    saveGame();
    alert("💾 Uloženo!");
  });

  resetBtn?.addEventListener("click", () => {
    if (confirm("Resetovat hru?")) {
      count = 0;
      inventory = [];
      saveGame();
      updateDisplay();
      renderInventory();
    }
  });

  function animateCookie() {
    cookie.style.transform = "scale(0.9)";
    setTimeout(() => (cookie.style.transform = ""), 100);
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

  function getBonus() {
    return inventory.reduce((s, id) => {
      const t = tools.find((x) => x.id === id);
      return s + (t?.bonus || 0);
    }, 0);
  }

  function updateDisplay() {
    countDisplay.textContent = count;
  }

  function saveGame() {
    users[username].cookies = count;
    users[username].inventory = inventory;
    saveUsers(users);
    updateLeaderboardFirebase();
  }
}

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

// 🧠 Firebase inicializace (žádné getApps!)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Ulož skóre do Firebase
function updateLeaderboardFirebase() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const username = localStorage.getItem("currentUser");
  if (!username || !users[username]) return;

  const score = users[username].cookies || 0;
  db.ref("leaderboard/" + username).set({ name: username, cookies: score });
}

// Zobrazení leaderboardu
const leaderboardEl = document.getElementById("leaderboard");
if (leaderboardEl) {
  db.ref("leaderboard").on("value", (snapshot) => {
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
