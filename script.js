// 🔥 Sušenka Web – hlavní script
console.log("🔥 Sušenka Web – script načten");

// === Pomocné funkce pro LocalStorage ===
const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const getCurrentUser = () => localStorage.getItem("currentUser");

// ===== Firebase konfigurace =====
const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28"
};

const hasFirebase = typeof window.firebase !== "undefined";

// ===== Init Firebase (jen jednou) =====
if (hasFirebase && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase inicializován");
}

// ===== Po načtení DOM =====
document.addEventListener("DOMContentLoaded", () => {
  initGame();
  initLeaderboard();
});

// ========================================================= //
//                        🎮 HRA                              //
// ========================================================= //
function initGame() {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");

  if (!cookie || !countDisplay) return; // nejsi na hra.html

  const tools = [
    { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
    { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
    { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
    { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
  ];

  const username = getCurrentUser() || "host";
  const users = loadUsers();

  if (!users[username]) {
    users[username] = { cookies: 0, inventory: [], role: "clen" };
    saveUsers(users);
  }

  let count = users[username].cookies;
  let inventory = users[username].inventory;

  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  function updateDisplay() {
    countDisplay.textContent = count;
  }

  function getBonus() {
    return inventory.reduce((sum, id) => {
      const item = tools.find(t => t.id === id);
      return sum + (item ? item.bonus : 0);
    }, 0);
  }

  function saveGame() {
    users[username].cookies = count;
    users[username].inventory = inventory;
    saveUsers(users);
    updateLeaderboardLocal();
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
    if (!shop) return;
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
    if (!inventoryList) return;
    inventoryList.innerHTML = "";
    if (!inventory.length) {
      inventoryList.innerHTML = "<li>Nemáš žádné nástroje.</li>";
      return;
    }

    inventory.forEach((id) => {
      const t = tools.find(x => x.id === id);
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

// ========================================================= //
//                      🏆 LEADERBOARD                        //
// ========================================================= //
function initLeaderboard() {
  const leaderboardEl = document.getElementById("leaderboard");
  if (!leaderboardEl) {
    console.log("ℹ️ Leaderboard element nenalezen – stránka ho nemá");
    return;
  }

  if (!hasFirebase) {
    updateLeaderboardLocal();
    return;
  }

  console.log("🏆 Načítám leaderboard…");

  firebase.database().ref("leaderboard").on("value", (snapshot) => {
    leaderboardEl.innerHTML = "";

    if (!snapshot.exists()) {
      leaderboardEl.innerHTML = "<li>Žádná data</li>";
      return;
    }

    const data = [];

    snapshot.forEach((child) => {
      data.push({
        name: child.key,
        cookies: child.val().cookies || 0
      });
    });

    data.sort((a, b) => b.cookies - a.cookies);

    data.forEach((player, i) => {
      const li = document.createElement("li");
      const medal =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" : "🏅";

      li.innerHTML = `
        <span>${medal} ${player.name}</span>
        <span>${player.cookies} 🍪</span>
      `;
      leaderboardEl.appendChild(li);
    });

    console.log("✅ Leaderboard aktualizován");
  });
}

function updateLeaderboardLocal() {
  const leaderboard = document.getElementById("leaderboard");
  if (!leaderboard) return;

  const users = loadUsers();
  const list = Object.entries(users).map(([name, data]) => ({
    name,
    cookies: data.cookies || 0
  }));

  list.sort((a, b) => b.cookies - a.cookies);

  leaderboard.innerHTML = "";

  if (!list.length) {
    leaderboard.innerHTML = "<li>Žádní hráči zatím nejsou.</li>";
    return;
  }

  list.forEach((p, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
    const li = document.createElement("li");

    li.innerHTML = `${medal} #${i + 1} ${p.name} <span>${p.cookies} 🍪</span>`;
    leaderboard.appendChild(li);
  });
}

// ========================================================= //
//                    💎 ADMIN PANEL                         //
// ========================================================= //
window.addAdmin = function () {
  const name = document.getElementById("admin-name")?.value?.trim();
  if (!name) return alert("⚠️ Zadej jméno!");

  const users = loadUsers();
  if (!users[name]) return alert("❌ Uživatel neexistuje!");

  users[name].role = "admin";
  saveUsers(users);

  alert(`👑 ${name} je nyní admin!`);
  window.listAdmins();
};

window.listAdmins = function () {
  const list = document.getElementById("admin-list");
  if (!list) return;

  const users = loadUsers();
  list.innerHTML = "";

  const admins = Object.entries(users).filter(([n, u]) => u.role === "admin" || u.role === "vedouci");

  if (!admins.length) {
    list.innerHTML = "<li>Žádní admini.</li>";
    return;
  }

  admins.forEach(([name]) => {
    const li = document.createElement("li");
    li.textContent = `👑 ${name}`;
    list.appendChild(li);
  });
};

window.listUsers = function () {
  const list = document.getElementById("user-list");
  if (!list) return;

  const users = loadUsers();
  list.innerHTML = "";

  for (const [name, u] of Object.entries(users)) {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${name}</strong>
      <br><span style="opacity:0.7">${u.role}</span>
    `;
    list.appendChild(li);
  }
};
