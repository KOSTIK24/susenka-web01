// ========== 🍪 SUŠENKA WEB – HLAVNÍ SCRIPT (LOGIN, REGISTRACE, HRA, ADMIN PANEL) ==========
console.log("✅ Sušenka Web – hlavní skript načten");

// Firebase moduly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔥 Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciCDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Pomocné funkce
const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const setCurrentUser = (name) => localStorage.setItem("currentUser", name);
const getCurrentUser = () => localStorage.getItem("currentUser");
const hashPass = (str) => btoa(unescape(encodeURIComponent(str)));

// === Zobrazení přihlášeného uživatele ===
document.addEventListener("DOMContentLoaded", () => {
  const topbarAvatar = document.getElementById("topbar-avatar");
  const topbarUsername = document.getElementById("topbar-username");

  const username = getCurrentUser();
  if (!username) return;

  const users = loadUsers();
  const user = users[username];
  if (!user) return;

  if (topbarAvatar) topbarAvatar.src = user.avatar || "images/susenka-logo.png";
  if (topbarUsername) {
    if (user.email === "susenky17@gmail.com") {
      topbarUsername.innerHTML = `💎 Vedoucí: <b>${username}</b>`;
    } else if (user.role === "admin") {
      topbarUsername.innerHTML = `👑 Admin: <b>${username}</b>`;
    } else {
      topbarUsername.textContent = username;
    }
  }
});

// === Registrace ===
const btnRegister = document.getElementById("btn-register");
if (btnRegister) {
  btnRegister.addEventListener("click", async () => {
    const name = (document.getElementById("reg-name").value || "").trim();
    const email = (document.getElementById("reg-email").value || "").trim().toLowerCase();
    const pass = (document.getElementById("reg-pass").value || "").trim();
    const avatar = (document.getElementById("reg-avatar").value || "").trim();

    if (!name || !email || !pass) return alert("Vyplň jméno, e-mail a heslo!");

    const users = loadUsers();
    if (users[name]) return alert("Uživatel už existuje!");

    const isLeader = email === "susenky17@gmail.com";
    const newUser = {
      pass: hashPass(pass),
      email,
      avatar: avatar || "images/susenka-logo.png",
      role: isLeader ? "vedouci" : "clen",
      cookies: 0,
      inventory: []
    };

    users[name] = newUser;
    saveUsers(users);
    setCurrentUser(name);

    // Uložení do Firebase
    await set(ref(db, "users/" + name), {
      username: name,
      email,
      avatar: newUser.avatar,
      role: newUser.role,
      cookies: 0
    });

    alert(isLeader ? "💎 Vítej, Vedoucí Sušenka Web!" : "Účet vytvořen ✅");
    location.href = "../index.html";
  });
}

// === Přihlášení ===
const btnLogin = document.getElementById("btn-login");
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    const name = (document.getElementById("login-name").value || "").trim();
    const pass = (document.getElementById("login-pass").value || "").trim();
    const users = loadUsers();

    if (!users[name]) return alert("Uživatel neexistuje!");
    if (users[name].pass !== hashPass(pass)) return alert("Špatné heslo!");

    setCurrentUser(name);
    alert("✅ Přihlášeno");
    location.href = "../index.html";
  });
}

// === Hra (Cookie Clicker s nástroji + chat vpravo) ===
document.addEventListener("DOMContentLoaded", () => {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  if (cookie && countDisplay) {
    const tools = [
      { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
      { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
      { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
      { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
    ];

    const username = getCurrentUser();
    const users = loadUsers();
    const user = users[username] || {};
    let count = parseInt(user.cookies || 0);
    let inventory = user.inventory || [];

    updateDisplay();
    renderShop();
    renderInventory();

    cookie.addEventListener("click", () => {
      count += 1 + getBonus();
      updateDisplay();
      saveGame();
    });

    saveBtn?.addEventListener("click", () => {
      saveGame();
      alert("💾 Uloženo!");
    });

    resetBtn?.addEventListener("click", () => {
      if (confirm("Opravdu chceš resetovat hru?")) {
        count = 0;
        inventory = [];
        saveGame();
        updateDisplay();
        renderInventory();
      }
    });

    exportBtn?.addEventListener("click", () => {
      const data = JSON.stringify({ cookies: count, inventory });
      navigator.clipboard.writeText(data);
      alert("📋 Exportováno do schránky!");
    });

    importBtn?.addEventListener("click", () => {
      const data = prompt("Vlož exportovaný JSON:");
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        count = parsed.cookies || 0;
        inventory = parsed.inventory || [];
        saveGame();
        updateDisplay();
        renderInventory();
      } catch {
        alert("❌ Neplatný formát!");
      }
    });

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
        li.innerHTML = `${t.name} • +${t.bonus} 🍪 / klik <button class="btn" style="margin-left:8px;" onclick="window.sellTool('${id}')">💰 Prodat</button>`;
        inventoryList.appendChild(li);
      });
    }

    function buyTool(tool) {
      if (inventory.includes(tool.id)) return;
      if (count < tool.cost) return alert("❌ Nemáš dost sušenek!");
      count -= tool.cost;
      inventory.push(tool.id);
      saveGame();
      updateDisplay();
      renderInventory();
      renderShop();
    }

    window.sellTool = function (id) {
      const tool = tools.find((x) => x.id === id);
      if (!tool) return;
      if (!confirm(`Prodat ${tool.name} za ${tool.cost / 2} sušenek?`)) return;
      inventory = inventory.filter((i) => i !== id);
      count += tool.cost / 2;
      saveGame();
      updateDisplay();
      renderInventory();
      renderShop();
    };

    function saveGame() {
      if (!username || !users[username]) return;
      users[username].cookies = count;
      users[username].inventory = inventory;
      saveUsers(users);
    }

    function getBonus() {
      return inventory.reduce((sum, id) => {
        const t = tools.find((x) => x.id === id);
        return sum + (t?.bonus || 0);
      }, 0);
    }

    function updateDisplay() {
      countDisplay.textContent = count;
    }
  }
});

// 💎 ADMIN PANEL FUNKCE
window.addAdmin = function () {
  const username = document.getElementById("admin-name").value.trim();
  const users = loadUsers();
  if (!users[username]) return alert("❌ Uživatel neexistuje!");
  users[username].role = "admin";
  saveUsers(users);
  alert(`✅ ${username} byl povýšen na admina!`);
  window.listAdmins();
};

window.listAdmins = function () {
  const list = document.getElementById("admin-list");
  const users = loadUsers();
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
  const users = loadUsers();
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
      </div>
    `;
    list.appendChild(li);
  }
};

window.giveCookies = function () {
  let count = parseInt(localStorage.getItem("count")) || 0;
  count += 1000;
  localStorage.setItem("count", count);
  alert("🍪 Přidáno 1000 sušenek!");
};

window.clearUsers = function () {
  if (confirm("Opravdu chceš smazat všechny účty?")) {
    localStorage.removeItem("users");
    localStorage.removeItem("currentUser");
    alert("🧹 Všechny účty byly smazány.");
    location.reload();
  }
};
// 🏆 LEADERBOARD
document.addEventListener("DOMContentLoaded", () => {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const leaderboard = document.getElementById("leaderboard");
  if (!leaderboard) return;

  const sorted = Object.entries(users)
    .sort((a, b) => (b[1].cookies || 0) - (a[1].cookies || 0))
    .slice(0, 10);

  leaderboard.innerHTML = "";
  sorted.forEach(([name, u], i) => {
    const li = document.createElement("li");
    li.innerHTML = `#${i + 1} <b>${name}</b> – ${u.cookies || 0} 🍪`;
    leaderboard.appendChild(li);
  });
});
