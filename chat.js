// ========== 💬 SUŠENKA CHAT (bez duplicate-app chyby) ========== //
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  set,
  onDisconnect,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciCDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.firebaseio.com",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28",
  measurementId: "G-012LNBPFGJ"
};

// ✅ Zabráníme chybě “Firebase App '[DEFAULT]' already exists”
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📦 DOM prvky
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("chat-message");
const onlineList = document.getElementById("online-users");

// 🔐 Data o uživateli
const users = JSON.parse(localStorage.getItem("users") || "{}");
const username = localStorage.getItem("currentUser") || "Anonym";
const avatar = (users[username]?.avatar) || "../images/susenka-logo.png";

// === 🟢 ONLINE STATUS ===
const userRef = ref(db, "online/" + username);
set(userRef, true);
onDisconnect(userRef).remove();

// 🧍 Aktualizace online seznamu
onValue(ref(db, "online"), (snapshot) => {
  const data = snapshot.val() || {};
  onlineList.innerHTML = "";
  Object.keys(data).forEach((name) => {
    const li = document.createElement("li");
    li.textContent = "🟢 " + name;
    onlineList.appendChild(li);
  });
});

// === 💬 ODESÍLÁNÍ ZPRÁV ===
if (sendBtn && input) {
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
}

function sendMessage() {
  let text = input.value.trim();
  if (!text) return;

  // 🧹 Cenzura sprostých slov (včetně variant)
  const badWords = [
    "kokot","kokoti","kokotem","kokote","kokotina",
    "kurva","kurvy","kurvo","kurven","kurvám","kurvách",
    "kunda","kundy","kundou","kundám","kundách",
    "porno","pornem","pornu","pornos","porny",
    "sex","sexu","sexy","sexem","sexuální",
    "penis","penisy","penisem","penisu",
    "píča","píči","píčo","píčou","píčovina","píčoviny","pica","picovina",
    "prdel","prdele","prdelí","prdelka","prdelky","prdelce"
  ];
  const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
  text = text.replace(regex, (match) => "★".repeat(match.length));

  push(ref(db, "messages"), {
    name: username,
    avatar,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  input.value = "";
}

// === 💬 ZOBRAZENÍ ZPRÁV ===
onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const isOwn = msg.name === username;

  const msgDiv = document.createElement("div");
  msgDiv.className = "msg";
  msgDiv.innerHTML = `
    <div class="chat-row ${isOwn ? "own" : ""}">
      <img src="${msg.avatar}" class="chat-avatar" width="28" height="28" style="border-radius:50%;object-fit:cover;">
      <div class="bubble ${isOwn ? "own-bubble" : ""}">
        <b>${msg.name}</b><br>${msg.text}
        <span class="time">${msg.time}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
