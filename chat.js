// ========== 💬 SUŠENKA CHAT – Realtime + Online Status ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, onValue, set, remove, onDisconnect
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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

// === DOM ===
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("chat-message");
const onlineList = document.getElementById("online-users");

const username = localStorage.getItem("currentUser") || "Anonym";
const users = JSON.parse(localStorage.getItem("users") || "{}");
const avatar = users[username]?.avatar || "../images/susenka-logo.png";

// === ZPRÁVY ===
if (sendBtn && input) {
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  push(ref(db, "messages"), {
    name: username,
    text,
    avatar,
    time: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
  });

  input.value = "";
}

onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const isOwn = msg.name === username;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:10px;${isOwn ? "justify-content:flex-end;" : ""}">
      ${!isOwn ? `<img src="${msg.avatar}" width="32" height="32" style="border-radius:50%;object-fit:cover;">` : ""}
      <div class="bubble" style="${isOwn ? "background:#a770ef;" : ""}">
        <b>${msg.name}</b><br>${msg.text}
        <span class="time">${msg.time}</span>
      </div>
    </div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// === ONLINE UŽIVATELÉ ===
const userRef = ref(db, "online/" + username);

// 🟢 Zobrazí se jako online
set(userRef, { name: username, avatar });
onDisconnect(userRef).remove();

// 🔄 Aktualizace seznamu
onValue(ref(db, "online"), (snapshot) => {
  const data = snapshot.val() || {};
  onlineList.innerHTML = "";

  Object.values(data).forEach((u) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "8px";
    li.style.marginBottom = "6px";
    li.innerHTML = `
      <img src="${u.avatar}" width="26" height="26" style="border-radius:50%;object-fit:cover;">
      <span>🟢 ${u.name}</span>
    `;
    onlineList.appendChild(li);
  });
});
