
/ ========== 🍪 SUŠENKA WEB – HLAVNÍ SCRIPT (LOGIN, REGISTRACE, HRA, ADMIN, LEADERBOARD) ========== /

console.log("✅ Sušenka Web – hlavní skript načten");

document.addEventListener("DOMContentLoaded", () => {
  const loadUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
  const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
  const setCurrentUser = (name) => localStorage.setItem("currentUser", name);
  const getCurrentUser = () => localStorage.getItem("currentUser");
  const hashPass = (str) => btoa(unescape(encodeURIComponent(str)));

  const topbarAvatar = document.getElementById("topbar-avatar");
  const topbarUsername = document.getElementById("topbar-username");

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

  // === REGISTRACE ===
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) {
    btnRegister.addEventListener("click", () => {
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim().toLowerCase();
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
    });
  }

  // === LOGIN ===
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const name = document.getElementById("login-name").value.trim();
      const pass = document.getElementById("login-pass").value.trim();
      const users = loadUsers();

      if (!users[name]) return alert("Uživatel neexistuje!");
      if (users[name].pass !== hashPass(pass)) return alert("Špatné heslo!");

      setCurrentUser(name);
      alert("✅ Přihlášeno");
      location.href = "../index.html";
    });
  }

  // === HRA ===
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

    saveBtn?.addEventListener("click", () => { saveGame(); alert("💾 Uloženo!"); });
    resetBtn?.addEventListener("click", () => {
      if (confirm("Resetovat hru?")) {
        count = 0; inventory = [];
        saveGame(); updateDisplay(); renderInventory();
      }
    });

    exportBtn?.addEventListener("click", () => {
      const data = JSON.stringify({ cookies: count, inventory });
      navigator.clipboard.writeText(data);
      alert("📋 Exportováno!");
    });

    importBtn?.addEventListener("click", () => {
      const data = prompt("Vlož exportovaný JSON:");
      if (!data) return;
      try {
        const parsed = JSON.parse(data);
        count = parsed.cookies || 0;
        inventory = parsed.inventory || [];
        saveGame(); updateDisplay(); renderInventory();
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
        li.innerHTML = `${t.name} • +${t.bonus} 🍪 / klik`;
        inventoryList.appendChild(li);
      });
    }

    function buyTool(tool) {
      if (inventory.includes(tool.id)) return;
      if (count < tool.cost) return alert("❌ Máš málo sušenek!");
      count -= tool.cost;
      inventory.push(tool.id);
      saveGame(); updateDisplay(); renderInventory(); renderShop();
    }

    function saveGame() {
      if (!username || !users[username]) return;
      users[username].cookies = count;
      users[username].inventory = inventory;
      saveUsers(users);
      updateLeaderboard();
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

  // 🏆 LEADERBOARD
  window.updateLeaderboard = function () {
    const list = document.getElementById("leaderboard");
    if (!list) return;
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const sorted = Object.entries(users)
      .map(([name, u]) => ({ name, cookies: u.cookies || 0 }))
      .sort((a, b) => b.cookies - a.cookies);
    list.innerHTML = "";
    if (!sorted.length) list.innerHTML = "<li>Žádní hráči zatím nejsou.</li>";
    sorted.forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>#${i + 1}</span> ${p.name} <span>${p.cookies} 🍪</span>`;
      list.appendChild(li);
    });
  };
  updateLeaderboard();
});
/* ===== 💎 ADMIN PANEL – GLOBÁLNÍ FUNKCE PRO INDEX.HTML ===== */
(function adminGlobals() {
  // Zobrazení admin panelu (vedoucí/admin)
  document.addEventListener("DOMContentLoaded", () => {
    const panel = document.getElementById("admin-panel");
    if (!panel) return;

    const current = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const u = current ? users[current] : null;

    if (u && (u.role === "vedouci" || u.role === "admin" || (u.email || "").toLowerCase() === "susenky17@gmail.com")) {
      panel.style.display = "block";
      console.log("✅ Admin panel zobrazen");
    } else {
      console.warn("❌ Uživateli není admin panel povolen.");
    }
  });

  // 👑 Přidat admina
  window.addAdmin = function () {
    const input = document.getElementById("admin-name");
    if (!input) return alert("Pole pro jméno nenalezeno.");
    const username = (input.value || "").trim();
    if (!username) return alert("Zadej jméno uživatele.");

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!users[username]) return alert("❌ Uživatel neexistuje.");

    users[username].role = "admin";
    localStorage.setItem("users", JSON.stringify(users));
    alert(`✅ ${username} byl povýšen na admina.`);
    window.listAdmins();
  };

  // 👑 Vypsat adminy
  window.listAdmins = function () {
    const list = document.getElementById("admin-list");
    if (!list) return;

    const users = JSON.parse(localStorage.getItem("users") || "{}");
    list.innerHTML = "";

    const admins = Object.entries(users).filter(([_, u]) => u.role === "admin" || u.role === "vedouci");
    if (!admins.length) {
      list.innerHTML = "<li>Žádní admini zatím nejsou.</li>";
      return;
    }

    admins.forEach(([name, u]) => {
      const li = document.createElement("li");
      li.textContent = `👑 ${name} • ${u.role}`;
      list.appendChild(li);
    });
  };

  // 🍪 Přidat 1000 sušenek přihlášenému
  window.giveCookies = function () {
    const current = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (!current || !users[current]) return alert("Nikdo není přihlášen.");

    users[current].cookies = (users[current].cookies || 0) + 1000;
    localStorage.setItem("users", JSON.stringify(users));
    alert("🍪 Přidáno 1000 sušenek!");
  };

  // 🧹 Smazat všechny účty
  window.clearUsers = function () {
    if (!confirm("Opravdu chceš smazat všechny účty?")) return;
    localStorage.removeItem("users");
    localStorage.removeItem("currentUser");
    alert("🧹 Všechny účty smazány.");
    location.reload();
  };

  // 👥 Vypsat všechny registrované uživatele
  window.listUsers = function () {
    const list = document.getElementById("user-list");
    if (!list) return;

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
})();

