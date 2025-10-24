// script.js — Sušenka Web: hra + upgrade + registrace/přihlášení
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sušenka Web ready ✨");

  /* ======================
     AUTH (registrace / login)
     ====================== */
  const USERS_KEY = "susenka_users";
  const CURRENT_KEY = "susenka_current";

  // utility: načti users mapu
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveUsers(map) {
    localStorage.setItem(USERS_KEY, JSON.stringify(map));
  }
  // jednoduché "hashování" hesla (NEBEZPEČNÉ pro produkci — pro demo ok)
  function hashPass(str) {
    try { return btoa(str); } catch { return str; }
  }

  function setCurrentUser(username) {
    localStorage.setItem(CURRENT_KEY, username);
    renderTopbarUser();
  }
  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_KEY);
    renderTopbarUser();
  }
  function getCurrentUser() {
    return localStorage.getItem(CURRENT_KEY) || null;
  }
  function renderTopbarUser() {
    const username = getCurrentUser();
    const avatarEl = document.getElementById("topbar-avatar");
    const nameEl = document.getElementById("topbar-username");
    const logoutLink = document.getElementById("logout-link");
    if (!nameEl || !avatarEl) return; // stránka může mít jinou strukturu

    if (username) {
      const users = loadUsers();
      const profile = users[username] || {};
      avatarEl.src = profile.avatar || "../images/susenka-logo.png";
      nameEl.textContent = username;
      if (logoutLink) logoutLink.style.display = "inline-block";
    } else {
      avatarEl.src = "../images/susenka-logo.png";
      nameEl.innerHTML = 'Sušenka <b>Web</b>';
      if (logoutLink) logoutLink.style.display = "none";
    }
  }

  // register
  const btnRegister = document.getElementById("btn-register");
  if (btnRegister) {
    // avatar choices click
    document.querySelectorAll(".avatar-choice").forEach(img => {
      img.addEventListener("click", () => {
        const inp = document.getElementById("reg-avatar");
        inp.value = img.dataset.src || img.src;
        // vizuální feedback
        document.querySelectorAll(".avatar-choice").forEach(i => i.style.boxShadow = "");
        img.style.boxShadow = "0 6px 20px rgba(167,112,239,.35)";
      });
    });

    btnRegister.addEventListener("click", () => {
      const name = (document.getElementById("reg-name").value || "").trim();
      const pass = document.getElementById("reg-pass").value || "";
      const avatar = (document.getElementById("reg-avatar").value || "").trim();

      if (!name || !pass) { alert("Vyplň jméno i heslo."); return; }
      const users = loadUsers();
      if (users[name]) { alert("Uživatel již existuje."); return; }

      users[name] = {
        pass: hashPass(pass),
        avatar: avatar || "../images/susenka-logo.png"
      };
      saveUsers(users);
      setCurrentUser(name);
      alert("Účet vytvořen a přihlášen.");
    });
  }

  // login
  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const name = (document.getElementById("login-name").value || "").trim();
      const pass = document.getElementById("login-pass").value || "";
      if (!name || !pass) { alert("Vyplň jméno i heslo."); return; }
      const users = loadUsers();
      const profile = users[name];
      if (!profile) { alert("Uživatel neexistuje."); return; }
      if (profile.pass !== hashPass(pass)) { alert("Špatné heslo."); return; }
      setCurrentUser(name);
      alert("Přihlášení úspěšné.");
    });
  }

  // logout (global)
  window.logoutUser = function () {
    clearCurrentUser();
    alert("Odhlášeno.");
  };

  // vykresli topbar při načtení
  renderTopbarUser();

  /* ======================
     COOKIE CLICKER (hra + upgrade)
     ====================== */
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  const upgradeBtn = document.getElementById("upgrade");
  const upgradeInfo = document.getElementById("upgradeInfo");

  let count = parseInt(localStorage.getItem("count")) || 0;
  let autoClick = parseInt(localStorage.getItem("autoClick")) || 0;
  let upgradeCost = parseInt(localStorage.getItem("upgradeCost")) || 50;

  if (countDisplay) countDisplay.textContent = count;

  // klik na sušenku
  if (cookie) {
    cookie.addEventListener("click", () => {
      count++;
      countDisplay.textContent = count;
      localStorage.setItem("count", count);
      cookie.style.transform = "scale(0.9) rotate(-4deg)";
      setTimeout(() => cookie.style.transform = "", 100);
    });
  }

  // ukládání/reset/export/import
  window.saveGame = function () {
    localStorage.setItem("count", count);
    localStorage.setItem("autoClick", autoClick);
    localStorage.setItem("upgradeCost", upgradeCost);
    alert("💾 Hra byla uložena!");
  };

  window.resetGame = function () {
    if (!confirm("Opravdu resetovat hru?")) return;
    count = 0; autoClick = 0; upgradeCost = 50;
    localStorage.setItem("count", count);
    localStorage.setItem("autoClick", autoClick);
    localStorage.setItem("upgradeCost", upgradeCost);
    if (countDisplay) countDisplay.textContent = count;
    if (upgradeInfo) upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;
  };

  window.exportGame = function () {
    const data = JSON.stringify({ count, autoClick, upgradeCost });
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "susenka-save.json";
    a.click();
  };

  window.importGame = function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result || "{}");
          count = parseInt(data.count) || 0;
          autoClick = parseInt(data.autoClick) || 0;
          upgradeCost = parseInt(data.upgradeCost) || 50;
          localStorage.setItem("count", count);
          localStorage.setItem("autoClick", autoClick);
          localStorage.setItem("upgradeCost", upgradeCost);
          if (countDisplay) countDisplay.textContent = count;
          if (upgradeInfo) upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;
          alert("📥 Data načtena!");
        } catch (err) {
          alert("❌ Neplatný soubor!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // upgrade systém
  if (upgradeBtn && upgradeInfo) {
    upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;
    upgradeBtn.addEventListener("click", () => {
      if (count >= upgradeCost) {
        count -= upgradeCost;
        autoClick++;
        upgradeCost = Math.round(upgradeCost * 1.6);
        localStorage.setItem("count", count);
        localStorage.setItem("autoClick", autoClick);
        localStorage.setItem("upgradeCost", upgradeCost);
        if (countDisplay) countDisplay.textContent = count;
        upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;
        alert(`💫 Zakoupen upgrade! Automatický klik level ${autoClick}`);
      } else {
        alert("❌ Nemáš dost sušenek!");
      }
    });

    setInterval(() => {
      if (autoClick > 0) {
        count += autoClick;
        if (countDisplay) countDisplay.textContent = count;
        localStorage.setItem("count", count);
      }
    }, 1000);
  }

  // při přihlášení/registraci aktualizuj topbar znovu (pokud stránka stále otevřená)
  window.addEventListener("storage", (e) => {
    if (e.key === CURRENT_KEY) renderTopbarUser();
  });
});
