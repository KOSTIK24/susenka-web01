// ========== 💬 SUŠENKA CHAT (Firebase realtime + online seznam) ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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

// Inicializace Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// HTML elementy
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("chat-message");
const onlineList = document.getElementById("online-users");

// Uživatelské info
const users = JSON.parse(localStorage.getItem("users") || "{}");
const username = localStorage.getItem("currentUser") || "Anonym";
const user = users[username] || {};
const avatar = user.avatar || "../images/susenka-logo.png";

// Přidání uživatele do seznamu online
if (username) {
  const userRef = ref(db, "online/" + username);
  set(userRef, { name: username, avatar });
  onDisconnect(userRef).remove(); // automaticky odebere po odpojení
}

// Funkce odeslání zprávy
function sendMessage() {
  let text = input.value.trim();
  if (!text) return;

  // 🧹 CENZURA – zakázaná slova
  const badWords = ["kokot","kurva","kunda","porno","porn","sex","penis","píča","prdel","prdele"];
  const regex = new RegExp(badWords.join("|"), "gi");
  text = text.replace(regex, (match) => "★".repeat(match.length));

  // 🕒 Uložení zprávy
  push(ref(db, "messages"), {
    name: username,
    avatar,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  input.value = "";
}

  push(ref(db, "messages"), {
    name: username,
    avatar,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });

  input.value = "";
}

if (sendBtn && input) {
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
}

// Realtime posluchač zpráv
onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  if (!msg) return;

  const isOwn = msg.name === username;

  const msgDiv = document.createElement("div");
  msgDiv.className = "msg";
  msgDiv.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:8px;${isOwn ? "justify-content:flex-end;" : ""}">
      ${!isOwn ? `<img src="${msg.avatar}" width="32" height="32" style="border-radius:50%">` : ""}
      <div class="bubble" style="${isOwn ? "background:linear-gradient(145deg,#a770ef,#6c5ce7);" : ""}">
        <b>${msg.name}</b><br>${msg.text}
        <div class="time">${msg.time}</div>
      </div>
      ${isOwn ? `<img src="${msg.avatar}" width="32" height="32" style="border-radius:50%">` : ""}
    </div>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Realtime zobrazení online uživatelů
onChildAdded(ref(db, "online"), (snapshot) => {
  const u = snapshot.val();
  if (!u) return;
  const li = document.createElement("li");
  li.id = "user-" + snapshot.key;
  li.innerHTML = `<img src="${u.avatar}" width="20" height="20" style="border-radius:50%;margin-right:6px;"> ${u.name}`;
  onlineList.appendChild(li);
});

onChildAdded(ref(db, "online"), (snap) => {
  console.log("✅ Online uživatel připojen:", snap.key);
});

onChildAdded(ref(db, "online"), (snap) => {
  console.log("🔴 Online uživatel odpojen:", snap.key);
  const li = document.getElementById("user-" + snap.key);
  if (li) li.remove();
});
