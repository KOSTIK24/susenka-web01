console.log("🔥 Sušenka Web – Firebase verze načtena");

// === Inicializace Firebase ===
const firebaseConfig = {
    apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
    authDomain: "susenka-web-chat.firebaseapp.com",
    databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "susenka-web-chat"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// === Pomocné funkce ===
const getCurrentUser = () => localStorage.getItem("currentUser");
const setCurrentUser = (u) => localStorage.setItem("currentUser", u);

// === Automatické vytvoření hráče ===
async function ensureUserExists(username) {
    const ref = db.ref("users/" + username);

    const snap = await ref.get();
    if (!snap.exists()) {
        await ref.set({
            cookies: 0,
            inventory: [],
            role: "clen",
            email: ""
        });
        console.log("🆕 Vytvořen nový hráč:", username);
    }
}

// === Po načtení stránky ===
document.addEventListener("DOMContentLoaded", () => {
    initGame();
    initLeaderboard();
});

// =======================================================
//                     🎮 HRA
// =======================================================
function initGame() {
    const cookie = document.getElementById("cookie");
    const countDisplay = document.getElementById("count");
    if (!cookie || !countDisplay) return;

    const username = getCurrentUser() || "guest";
    setCurrentUser(username);

    ensureUserExists(username); // vytvoří účet ve Firebase

    const tools = [
        { name: "Dřevěná lopatka", id: "wood", cost: 50, bonus: 1 },
        { name: "Kovová lopata", id: "metal", cost: 200, bonus: 3 },
        { name: "Zlatá lopata", id: "gold", cost: 500, bonus: 6 },
        { name: "Sušenková mašina", id: "machine", cost: 1500, bonus: 15 }
    ];

    const shop = document.getElementById("shop");
    const inventoryList = document.getElementById("inventory");

    let count = 0;
    let inventory = [];

    // Načti hráče
    db.ref("users/" + username).on("value", snap => {
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
            const item = tools.find(t => t.id === id);
            return sum + (item ? item.bonus : 0);
        }, 0);
    }

    function saveGame() {
        db.ref("users/" + username).update({
            cookies: count,
            inventory: inventory
        });
        updateLeaderboardFirebase();
    }

    function buyTool(tool) {
        if (inventory.includes(tool.id)) return;
        if (count < tool.cost) return alert("❌ Máš málo sušenek!");

        count -= tool.cost;
        inventory.push(tool.id);

        saveGame();
        updateDisplay();
    }

    function renderShop() {
        shop.innerHTML = "";
        tools.forEach(t => {
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
        saveGame();
    });
}

// =======================================================
//                     🏆 LEADERBOARD
// =======================================================
function updateLeaderboardFirebase() {
    const username = getCurrentUser();
    if (!username) return;

    db.ref("users/" + username).get().then(snap => {
        if (!snap.exists()) return;

        const cookies = snap.val().cookies || 0;
        db.ref("leaderboard/" + username).set({
            name: username,
            cookies: cookies
        });
    });
}

function initLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    if (!leaderboard) return;

    db.ref("leaderboard").on("value", snap => {
        const list = [];
        snap.forEach(child => list.push(child.val()));

        list.sort((a, b) => b.cookies - a.cookies);

        leaderboard.innerHTML = "";
        list.forEach((p, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
            const li = document.createElement("li");
            li.innerHTML = `${medal} #${i + 1} ${p.name} <span>${p.cookies} 🍪</span>`;
            leaderboard.appendChild(li);
        });
    });
}

// =======================================================
//                   💎 ADMIN PANEL
// =======================================================
window.addAdmin = function () {
    const name = document.getElementById("admin-name")?.value.trim();
    if (!name) return alert("Zadej jméno!");

    db.ref("users/" + name).get().then(snap => {
        if (!snap.exists()) return alert("❌ Uživatel neexistuje!");

        db.ref("users/" + name).update({ role: "admin" });
        alert(`👑 Uživatel ${name} povýšen na admina!`);
        window.listAdmins();
    });
};

window.listAdmins = function () {
    const list = document.getElementById("admin-list");
    if (!list) return;

    db.ref("users").get().then(snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.role === "admin" || u.role === "vedouci") {
                const li = document.createElement("li");
                li.textContent = `👑 ${child.key}`;
                list.appendChild(li);
            }
        });
    });
};

window.listUsers = function () {
    const list = document.getElementById("user-list");
    if (!list) return;

    db.ref("users").get().then(snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            const li = document.createElement("li");
            li.textContent = `${child.key} • ${u.role}`;
            list.appendChild(li);
        });
    });
};
