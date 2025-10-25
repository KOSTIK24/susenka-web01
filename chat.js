// ===== 💬 Sušenka Chat (Firebase Realtime Database) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  serverTimestamp,
  onDisconnect,
  set
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.firebaseio.com/",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// ⚙️ Inicializace (zabraňuje duplicitnímu app erroru)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch {
  app = firebase.app();
}
const db = getDatabase(app);

const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("chat-message");
const sendBtn = document.getElementById("send-btn");
const onlineList = document.getElementById("online-users");

const currentUser = localStorage.getItem("currentUser") || "Neznámý";

// ===== ⚔️ Cenzura slov =====
const badWords = [
  "kokot","kunda","kurva","píča","prdel","porno","sex","penis",
  "pica","kundo","prasarna","shit","fuck","dick","cock","bitch"
];
function censor(text) {
  let result = text;
  badWords.forEach(w => {
    const regex = new RegExp(`\\b${w}\\b`, "gi");
    result = result.replace(regex, "❌");
  });
  return result;
}

// ===== 💬 Odeslání zprávy =====
if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const text = msgInput.value.trim();
    if (!text) return;

    const message = {
      user: currentUser,
      text: censor(text),
      time: new Date().toLocaleTimeString(),
      ts: serverTimestamp()
    };

    push(ref(db, "messages"), message);
    msgInput.value = "";
  });
}

// ===== 📡 Příjem zpráv =====
onChildAdded(ref(db, "messages"), (snapshot) => {
  const data = snapshot.val();
  const div = document.createElement("div");
  div.classList.add("msg");
  div.innerHTML = `<div class="bubble"><b>${data.user}</b>: ${data.text}</div><div class="time">${data.time}</div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ===== 🟢 Online systém =====
const userRef = ref(db, "online/" + currentUser);
set(userRef, true);
onDisconnect(userRef).remove();

onChildAdded(ref(db, "online"), (snap) => {
  const name = snap.key;
  const li = document.createElement("li");
  li.id = "user-" + name;
  li.textContent = name;
  onlineList.appendChild(li);
});

import { onChildRemoved } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
onChildRemoved(ref(db, "online"), (snap) => {
  const name = snap.key;
  const el = document.getElementById("user-" + name);
  if (el) el.remove();
});
