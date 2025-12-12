// =====================================
// 🍪 SUŠENKA WEB – HLAVNÍ SCRIPT (v8)
// =====================================

console.log("🔥 Sušenka Web – hlavní script načten");

// ===============================
// 🔐 KONFIGURACE
// ===============================
var firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var db = firebase.database();
var auth = firebase.auth();

// 🔑 HLAVNÍ VEDOUCÍ (ZDE ZMĚŇ EMAIL, POKUD CHCEŠ)
const LEADER_EMAIL = "susenky17@gmail.com";

// ===============================
// 👤 AUTH & USER BOOTSTRAP
// ===============================
auth.onAuthStateChanged(user => {
  if (!user) {
    console.log("👤 Nepřihlášen – přesměrování na login");
    return;
  }

 const username = user.email.split("@")[0].toLowerCase();

if (username === "admin" || username === "vedouci") {
  console.error("❌ Username nesmí být role");
  return;
}

  localStorage.setItem("currentUser", username);

  const ref = db.ref("users/" + username);

  ref.once("value").then(snap => {
    if (!snap.exists()) {
      ref.set({
        email: user.email,
        role: user.email === LEADER_EMAIL ? "vedouci" : "clen",
        cookies: 0,
        inventory: []
      });
      console.log("🆕 Vytvořen uživatel:", username);
    }
  });

  initApp(username);
});

// ===============================
// 🚀 START APLIKACE
// ===============================
function initApp(username) {
  initGame(username);
  initLeaderboard();
  initAdminPanel(username);
}

// ===============================
// 🎮 HRA
// ===============================
function initGame(username) {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  if (!cookie || !countDisplay) return;

  const tools = [
    { id: "wood", name: "Dřevěná lopatka", cost: 50, bonus: 1 },
    { id: "metal", name: "Kovová lopata", cost: 200, bonus: 3 },
    { id: "gold", name: "Zlatá lopata", cost: 500, bonus: 6 },
    { id: "machine", name: "Sušenková mašina", cost: 1500, bonus: 15 }
  ];

  let count = 0;
  let inventory = [];

  const shop = document.getElementById("shop");
  const inventoryList = document.getElementById("inventory");

  const userRef = db.ref("users/" + username);

  userRef.on("value", snap => {
    const data = snap.val();
    if (!data) return;
    count = data.cookies || 0;
    inventory = data.inventory || [];
    updateDisplay();
    renderShop();
    renderInventory();
  });

  function updateDisplay() {
    countDisplay.textContent = count;
  }

  function getBonus() {
    return inventory.reduce((sum, id) => {
      const t = tools.find(x => x.id === id);
      return sum + (t ? t.bonus : 0);
    }, 0);
  }

  function save() {
    userRef.update({ cookies: count, inventory });
    updateLeaderboard(username, count);
  }

  function buy(tool) {
    if (inventory.includes(tool.id)) return;
    if (count < tool.cost) return alert("❌ Máš málo sušenek");
    count -= tool.cost;
    inventory.push(tool.id);
    save();
  }

  function renderShop() {
    shop.innerHTML = "";
    tools.forEach(t => {
      const owned = inventory.includes(t.id);
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = owned ? "✅ Vlastníš" : `🛒 ${t.name} (${t.cost})`;
      btn.disabled = owned;
      btn.onclick = () => buy(t);
      shop.appendChild(btn);
    });
  }

  function renderInventory() {
    inventoryList.innerHTML = "";
    if (!inventory.length) {
      inventoryList.innerHTML = "<li>Nemáš žádné nástroje.</li>";
      return;
    }
    inventory.forEach(id => {
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
    save();
  });
}

// ===============================
// 🏆 LEADERBOARD
// ===============================
function updateLeaderboard(username, cookies) {
  db.ref("leaderboard/" + username).set({
    name: username,
    cookies: cookies
  });
}

function initLeaderboard() {
  const el = document.getElementById("leaderboard");
  if (!el) return;

  db.ref("leaderboard").on("value", snap => {
    el.innerHTML = "";
    const arr = [];
    snap.forEach(c => arr.push(c.val()));
    arr.sort((a, b) => b.cookies - a.cookies);

    arr.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
      const li = document.createElement("li");
      li.innerHTML = `${medal} ${p.name} <span>${p.cookies} 🍪</span>`;
      el.appendChild(li);
    });
  });
}

// ===============================
// 💎 ADMIN PANEL
// ===============================
function initAdminPanel(username) {
  const panel = document.getElementById("admin-panel");
  if (!panel) return;

  db.ref("users/" + username + "/role").once("value").then(snap => {
    const role = snap.val();
    if (role === "admin" || role === "vedouci") {
      panel.style.display = "block";
      console.log("💎 Admin panel aktivní");
    }
  });
}

window.addAdmin = function () {
  const name = document.getElementById("admin-name")?.value.trim();
  if (!name) return alert("Zadej jméno");

  db.ref("users/" + name).once("value").then(snap => {
    if (!snap.exists()) return alert("Uživatel neexistuje");
    db.ref("users/" + name).update({ role: "admin" });
    alert(`👑 ${name} je admin`);
  });
};

window.listAdmins = function () {
  const list = document.getElementById("admin-list");
  if (!list) return;
  list.innerHTML = "";

  db.ref("users").once("value").then(snap => {
    snap.forEach(c => {
      const u = c.val();
      if (u.role === "admin" || u.role === "vedouci") {
        const li = document.createElement("li");
        li.textContent = `👑 ${c.key}`;
        list.appendChild(li);
      }
    });
  });
};

window.listUsers = function () {
  const list = document.getElementById("user-list");
  if (!list) return;
  list.innerHTML = "";

  db.ref("users").once("value").then(snap => {
    snap.forEach(c => {
      const u = c.val();
      const li = document.createElement("li");
      li.textContent = `${c.key} • ${u.role}`;
      list.appendChild(li);
    });
  });
};
