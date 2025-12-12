// ===== 💬 SUŠENKA CHAT + LEADERBOARD (Firebase) =====
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, onChildRemoved,
  set, onDisconnect, serverTimestamp, onValue
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciCDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.firebasestorage.app",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28",
  measurementId: "G-012LNBPFGJ"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM hooks (exist only on hra.html)
const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("chat-message");
const sendBtn = document.getElementById("send-btn");
const onlineList = document.getElementById("online-users");
const leaderboardEl = document.getElementById("leaderboard");

const username = localStorage.getItem("currentUser") || "Neznámý";

// Cenzura badwords (variace)
const badWords = [
  "kokot","kokoti","kokota","kokote",
  "kunda","kundy","kunde","kundou",
  "kurva","kurvy","kurvo","kurvou",
  "píča","pica","piča","pi*","píči","píču",
  "prdel","prdele","prdeli","prdelí",
  "porno","porn",
  "sex","sexy",
  "penis","penisu",
  "jeb","mrd","mrdat","mrda","mrdo",
  "shit","fuck","dick","cock","bitch","sperm"
];
function censor(text) {
  let out = text;
  badWords.forEach(w => {
    const re = new RegExp(w, "gi");
    out = out.replace(re, "❌");
  });
  return out;
}

// ===== Chat send/receive =====
function sendMessage() {
  if (!msgInput) return;
  const text = msgInput.value.trim();
  if (!text) return;
  push(ref(db, "messages"), {
    user: username,
    text: censor(text),
    time: new Date().toLocaleTimeString(),
    ts: serverTimestamp()
  });
  msgInput.value = "";
}

if (sendBtn && msgInput) {
  sendBtn.addEventListener("click", sendMessage);
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

if (chatBox) {
  onChildAdded(ref(db, "messages"), (snap) => {
    const m = snap.val();
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<div class="bubble"><b>${m.user}</b>: ${m.text}<div class="time">${m.time || ""}</div></div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// ===== Online presence =====
if (onlineList) {
  const meRef = ref(db, "online/" + username);
  set(meRef, true);
  onDisconnect(meRef).remove();

  onValue(ref(db, "online"), (snap) => {
    onlineList.innerHTML = "";
    snap.forEach(child => {
      const li = document.createElement("li");
      li.textContent = child.key;
      onlineList.appendChild(li);
    });
  });
}

// ===== Leaderboard API (globální) =====
window.firebaseLeaderboard = {
  setScore(name, score) {
    set(ref(db, "leaderboard/" + name), { name, cookies: score });
  },
  watch(render) {
    onValue(ref(db, "leaderboard"), (snap) => {
      const arr = [];
      snap.forEach(ch => arr.push(ch.val()));
      arr.sort((a,b)=> (b.cookies||0)-(a.cookies||0));
      render(arr);
    });
  }
};

// Auto-watch pokud existuje #leaderboard
if (leaderboardEl) {
  window.firebaseLeaderboard.watch((rows) => {
    leaderboardEl.innerHTML = rows.length ? "" : "<li>Žádní hráči zatím nejsou.</li>";
    rows.forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `#${i+1} ${p.name} <span>${p.cookies||0} 🍪</span>`;
      leaderboardEl.appendChild(li);
    });
  });
}
