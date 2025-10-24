/* ========== 🍪 SUŠENKA WEB – LOGIN / REGISTRACE / ADMIN PANEL ========== */

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
