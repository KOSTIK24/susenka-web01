// ========== 💬 SUŠENKA CHAT – Firebase Realtime Database ==========//
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciCDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28",
};

// 🔥 Firebase inicializace
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📦 DOM
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("chat-message");

if (sendBtn && input) {
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
}

// ✉️ Odesílání
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const username = localStorage.getItem("currentUser") || "Anonym";
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const avatar = users[username]?.avatar || "../images/susenka-logo.png";

  push(ref(db, "messages"), {
    name: username,
    text,
    avatar,
    time: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
  });

  input.value = "";
}

// 📡 Příjem nových zpráv
onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const username = localStorage.getItem("currentUser") || "Anonym";
  const isOwn = msg.name === username;

  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:10px;${isOwn ? 'justify-content:flex-end;' : ''}">
      ${!isOwn ? `<img src="${msg.avatar}" width="32" height="32" style="border-radius:50%;object-fit:cover;">` : ""}
      <div class="bubble" style="${isOwn ? 'background:#a770ef;' : ''}">
        <b>${msg.name}</b><br>${msg.text}
        <span class="time">${msg.time}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});
