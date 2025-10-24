/* ========== 💬 SUŠENKA WEB CHAT – Firebase Realtime Chat ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

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

// 🔥 Inicializace Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📦 DOM prvky
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("chat-message");

if (sendBtn && input) {
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const username = localStorage.getItem("currentUser") || "Anonym";
  const user = users[username] || {};
  const avatar = user.avatar || "../images/susenka-logo.png";
  const time = new Date().toLocaleTimeString();

  push(ref(db, "messages"), {
    name: username,
    avatar,
    text,
    time
  });

  input.value = "";
}

onChildAdded(ref(db, "messages"), (snapshot) => {
  const msg = snapshot.val();
  const username = localStorage.getItem("currentUser") || "Anonym";
  const isOwn = msg.name === username;

  const msgDiv = document.createElement("div");
  msgDiv.className = "msg";
  msgDiv.innerHTML = `
    <div class="chat-row ${isOwn ? "own" : ""}">
      <img src="${msg.avatar}" class="chat-avatar">
      <div class="bubble ${isOwn ? "own-bubble" : ""}">
        <b>${msg.name}</b><br>
        ${msg.text}
        <span class="time">${msg.time}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
