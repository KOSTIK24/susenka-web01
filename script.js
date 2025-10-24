/* ========== 🍪 SUŠENKA WEB – LOGIN / REGISTRACE / ADMIN PANEL ========== */

console.log("✅ Skript načten");
document.addEventListener("DOMContentLoaded", () => {
  // === Pomocné funkce ===
  const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
  const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
  const setCurrentUser = (name) => localStorage.setItem("currentUser", name);
  const getCurrentUser = () => localStorage.getItem("currentUser");
  const hashPass = (str) => btoa(unescape(encodeURIComponent(str)));

  const topbarAvatar = document.getElementById("topbar-avatar");
  const topbarUsername = document.getElementById("topbar-username");

  /* === Zobrazení přihlášeného uživatele === */
  renderTopbarUser();

  function renderTopbarUser() {
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
  }

  /* === Registrace === */
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) {
    btnRegister.addEventListener("click", () => {
      const name = (document.getElementById("reg-name").value || "").trim();
      const email = (document.getElementById("reg-email").value || "").trim().toLowerCase();
      const pass = (document.getElementById("reg-pass").value || "").trim();
      const avatar = (document.getElementById("reg-avatar").value || "").trim();

      if (!name || !email || !pass) {
        alert("Vyplň jméno, e-mail a heslo!");
        return;
      }

      const users = loadUsers();
      if (users[name]) {
        alert("Uživatel už existuje!");
        return;
      }

      const isLeader = email === "susenky17@gmail.com";
      users[name] = {
        pass: hashPass(pass),
        email,
        avatar: avatar || "images/susenka-logo.png",
        role: isLeader ? "vedouci" : "clen"
      };

      saveUsers(users);
      setCurrentUser(name);
      alert(isLeader ? "💎 Vítej, Vedoucí Sušenka Web!" : "Účet vytvořen ✅");
      location.href = "../index.html";
    });
  }

  /* === Přihlášení === */
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const name = (document.getElementById("login-name").value || "").trim();
      const pass = (document.getElementById("login-pass").value || "").trim();

      const users = loadUsers();
      if (!users[name]) {
        alert("Uživatel neexistuje!");
        return;
      }
      if (users[name].pass !== hashPass(pass)) {
        alert("Špatné heslo!");
        return;
      }

      setCurrentUser(name);
      alert("✅ Přihlášeno");
      location.href = "../index.html";
    });
  }

  /* === Výběr profilovky === */
  document.querySelectorAll(".avatar-choice").forEach((img) => {
    img.addEventListener("click", () => {
      const src = img.getAttribute("data-src");
      const input = document.getElementById("reg-avatar");
      if (input) input.value = src;
      document.querySelectorAll(".avatar-choice").forEach((i) => (i.style.outline = ""));
      img.style.outline = "3px solid #a770ef";
    });
  });

  /* === Admin panel (jen pro vedoucího) === */
  const current = getCurrentUser();
  const users = loadUsers();
  const user = users[current];
  if (user && user.email === "susenky17@gmail.com") {
    const panel = document.getElementById("admin-panel");
    if (panel) panel.style.display = "block";
  }

  window.addAdmin = function () {
    const username = document.getElementById("admin-name").value.trim();
    const users = loadUsers();
    if (!users[username]) {
      alert("Uživatel neexistuje!");
      return;
    }
    users[username].role = "admin";
    saveUsers(users);
    alert(`✅ ${username} byl povýšen na admina!`);
    listAdmins();
  };

  window.listAdmins = function () {
    const list = document.getElementById("admin-list");
    const users = loadUsers();
    list.innerHTML = "";
    for (const [name, u] of Object.entries(users)) {
      if (u.role === "admin") {
        const li = document.createElement("li");
        li.textContent = `👑 ${name} (${u.email})`;
        list.appendChild(li);
      }
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
      alert("Všechny účty byly smazány.");
      location.reload();
    }
  };
});
/* === ZOBRAZENÍ REGISTROVANÝCH UŽIVATELŮ (jen pro vedoucího) === */
window.listUsers = function () {
  const list = document.getElementById("user-list");
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  list.innerHTML = "";

  if (!Object.keys(users).length) {
    list.innerHTML = "<li>Žádní uživatelé zatím nejsou registrovaní.</li>";
    return;
  }

  for (const [name, u] of Object.entries(users)) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;background:rgba(255,255,255,.05);padding:6px 10px;border-radius:10px;">
        <img src="${u.avatar || 'images/susenka-logo.png'}" width="32" height="32" style="border-radius:50%;object-fit:cover;">
        <div>
          <strong>${name}</strong> <br>
          <span style="font-size:13px;color:#ccc;">${u.email || "bez e-mailu"} • ${u.role || "člen"}</span>
        </div>
      </div>
    `;
    list.appendChild(li);
  }
};
/* ========== 🍪 SUŠENKA HRA S NÁSTROJI ========== */
document.addEventListener("DOMContentLoaded", () => {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  if (!cookie || !countDisplay) return;

  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");
  const importBtn = document.getElementById("import-btn");
  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  // 🧾 Ceník nástrojů
  const tools = [
    { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
    { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
    { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
    { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
  ];

  const username = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[username] || {};
  let count = parseInt(user.cookies || 0);
  let inventory = user.inventory || [];

  // Zobrazení
  updateDisplay();
  renderShop();
  renderInventory();

  // 🍪 Klikání
  cookie.addEventListener("click", () => {
    const bonus = getBonus();
    count += 1 + bonus;
    updateDisplay();
    saveGame();
  });

  saveBtn.addEventListener("click", () => {
     saveGame();
    alert("💾 Uloženo!");
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Opravdu chceš resetovat hru?")) {
      count = 0;
      inventory = [];
      saveGame();
      updateDisplay();
      renderInventory();
      alert("🔄 Reset hotov!");
    }
  });

  exportBtn.addEventListener("click", () => {
    const data = JSON.stringify({ cookies: count, inventory });
    navigator.clipboard.writeText(data);
    alert("📋 Exportováno do schránky!");
  });

  importBtn.addEventListener("click", async () => {
    const data = prompt("Vlož exportovaný JSON:");
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      count = parsed.cookies || 0;
      inventory = parsed.inventory || [];
      saveGame();
      updateDisplay();
      renderInventory();
      alert("✅ Importováno!");
    } catch {
      alert("❌ Neplatný formát!");
    }
  });

  // 🏪 Obchod
  function renderShop() {
    shop.innerHTML = "";
    tools.forEach((t) => {
      const owned = inventory.includes(t.id);
      const btnText = owned ? "✅ Vlastníš" : `🛒 Koupit (${t.cost})`;
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = btnText;
      btn.disabled = owned;
      btn.onclick = () => buyTool(t);
      shop.appendChild(btn);
    });
  }

  // 🎒 Inventář
  function renderInventory() {
    inventoryList.innerHTML = "";
    if (!inventory.length) {
      inventoryList.innerHTML = "<li>Nemáš žádné nástroje.</li>";
      return;
    }

    inventory.forEach((id) => {
      const t = tools.find((x) => x.id === id);
      const li = document.createElement("li");
      li.innerHTML = `${t.name} • +${t.bonus} 🍪 / klik <button class="btn" style="margin-left:8px;" onclick="sellTool('${id}')">💰 Prodat</button>`;
      inventoryList.appendChild(li);
    });
  }

  // 💸 Koupit nástroj
  function buyTool(tool) {
    if (inventory.includes(tool.id)) return;
    if (count < tool.cost) {
      alert("❌ Nemáš dost sušenek!");
      return;
    }
    count -= tool.cost;
    inventory.push(tool.id);
    saveGame();
    updateDisplay();
    renderInventory();
    renderShop();
    alert(`✅ Koupil jsi ${tool.name}!`);
  }

  // 💰 Prodat nástroj
  window.sellTool = function (id) {
    const tool = tools.find((x) => x.id === id);
    if (!tool) return;
    const confirmSell = confirm(`Chceš prodat ${tool.name} za ${Math.floor(tool.cost / 2)} sušenek?`);
    if (!confirmSell) return;
    inventory = inventory.filter((i) => i !== id);
    count += Math.floor(tool.cost / 2);
    saveGame();
    updateDisplay();
    renderInventory();
    renderShop();
    alert("💰 Prodáno!");
  };

  // 💾 Uložení
  function saveGame() {
    if (!username || !users[username]) return;
    users[username].cookies = count;
    users[username].inventory = inventory;
    localStorage.setItem("users", JSON.stringify(users));
  }

  function getBonus() {
    let total = 0;
    inventory.forEach((id) => {
      const tool = tools.find((x) => x.id === id);
      if (tool) total += tool.bonus;
    });
    return total;
  }

  function updateDisplay() {
    countDisplay.textContent = count;
  }
});
