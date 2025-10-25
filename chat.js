// 💬 SUŠENKA CHAT – Firebase realtime chat + online systém + cenzura
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onChildRemoved,
  set,
  onDisconnect,
  serverTimestamp,
  onValue
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// ✅ Firebase konfigurace
const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.firebaseio.com/",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// 🧩 Inicializace bez duplikátu
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📦 DOM prvky
const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("chat-message");
const sendBtn = document.getElementById("send-btn");
const onlineList = document.getElementById("online-users");

const username = localStorage.getItem("currentUser") || "Neznámý";

// ⚔️ Cenzura sprostých slov
const badWords = [
  "kokot","kunda","kurva","píča","prdel","porno","sex","penis",
  "pica","kundo","prasarna","shit","fuck","dick","cock","bitch","sperm","jeb","mrdat"
];
function censor(text) {
  let clean = text;
  for (const w of badWords) {
    const re = new RegExp(w, "gi");
    clean = clean.replace(re, "❌");
  }
  return clean;
}

// 💬 Odeslání zprávy
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  const message = {
    user: username,
    text: censor(text),
    time: new Date().toLocaleTimeString(),
    ts: serverTimestamp()
  };

  push(ref(db, "messages"), message);
  msgInput.value = "";
}

// ▶️ Kliknutí nebo Enter
if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (msgInput) msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// 📡 Příjem zpráv
onChildAdded(ref(db, "messages"), (snap) => {
  const data = snap.val();
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg");
  msgDiv.innerHTML = `
    <div class="bubble">
      <b>${data.user}</b>: ${data.text}
      <div class="time">${data.time}</div>
    </div>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 🟢 Online systém
const userRef = ref(db, "online/" + username);
set(userRef, true);
onDisconnect(userRef).remove();

// ✅ Zobraz online hráče
onValue(ref(db, "online"), (snapshot) => {
  onlineList.innerHTML = "";
  snapshot.forEach((child) => {
    const li = document.createElement("li");
    li.textContent = child.key;
    onlineList.appendChild(li);
  });
});
