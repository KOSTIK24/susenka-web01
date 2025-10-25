// ========== 💎 SUŠENKA WEB – FIREBASE USERS ==========
// Tento skript načte a zobrazí všechny uživatele z Realtime Database

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔥 Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciCDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === Pomocná funkce pro přidání uživatele ===
export function saveUserToFirebase(username, email, avatar, role = "clen") {
  if (!username || !email) return;
  set(ref(db, "users/" + username), { username, email, avatar, role });
}

// === Funkce pro zobrazení všech uživatelů v admin panelu ===
export function showAllUsers() {
  const list = document.getElementById("user-list");
  if (!list) return;
  onValue(ref(db, "users"), (snapshot) => {
    const data = snapshot.val() || {};
    list.innerHTML = "";
    if (!Object.keys(data).length) {
      list.innerHTML = "<li>Žádní uživatelé nejsou registrovaní.</li>";
      return;
    }

    for (const user of Object.values(data)) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;background:rgba(255,255,255,.05);padding:6px 10px;border-radius:10px;">
          <img src="${user.avatar || 'images/susenka-logo.png'}" width="32" height="32" style="border-radius:50%;object-fit:cover;">
          <div>
            <strong>${user.username}</strong><br>
            <span style="font-size:13px;color:#ccc;">${user.email} • ${user.role || "člen"}</span>
          </div>
        </div>
      `;
      list.appendChild(li);
    }
  });
}
