// chat.js (ES module) — realtime chat pro všechny hráče (Firebase)
// Pošle/obdrží zprávy mezi všemi klienty (bez změny layoutu či Enter-behavior).

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

/* ====== KONFIG ======
   Ujisti se, že tato URL odpovídá tvé Firebase DB (europe-west1).
   Pokud máš jinou konfiguraci, uprav pouze `databaseURL`/ostatní položky.
*/
const firebaseConfig = {
  apiKey: "AIzaSyDp-kZTn7M5oDCUOvPXYu4wF8uD8ztV0DM",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:0000000000000000"
};

// Inicializace Firebase (bez duplicit)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ====== DOM prvky (hra.html musí obsahovat tyto ID) ====== */
const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("chat-message");
const sendBtn = document.getElementById("send-btn");
const onlineList = document.getElementById("online-users");

/* Aktuální uživatel (musí být uložen v localStorage při přihlášení) */
const username = localStorage.getItem("currentUser") || "Neznámý";

/* ====== Cenzura (různé tvary) ====== */
const badWords = [
  "kokot","kokoti","kokota","kokote",
  "kunda","kundy","kunde","kundou",
  "kurva","kurvy","kurvo","kurvou",
  "píča","pica","pici","píči","píču",
  "prdel","prdele","prdelí","prdeli",
  "porno","porn",
  "sex","sexy",
  "penis","penisu",
  "shit","fuck","dick","cock","bitch","mrdat","jeb"
  "trump","trumpove",
];
function censor(text){
  let out = text;
  for(const w of badWords){
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
    out = out.replace(re, "❌");
  }
  return out;
}

/* ====== Odeslání zprávy ======
   (tlačítko a Enter obsluhuješ už v layoutu; tento kód volá sendMessage() když ho zavoláš)
*/
export function sendMessage() {
  if(!msgInput) return;
  const raw = msgInput.value || "";
  const text = raw.trim();
  if(!text) return;
  const record = {
    user: username,
    text: censor(text),
    time: new Date().toLocaleTimeString(),
    ts: serverTimestamp()
  };
  push(ref(db, "messages"), record)
    .catch(err => {
      console.error("Chyba při posílání zprávy:", err);
    });
  msgInput.value = "";
}

/* Připoj standardní ovládání ENTER / tlačítko pokud tam je (NECHÁM JE, ale pokud už je v jiném skriptu, nemusíš to duplikovat) */
if(sendBtn && msgInput){
  sendBtn.addEventListener("click", sendMessage);
  // Pozor: pokud máš v jiném souboru vlastní Enter-handler, mohou být dvě události.
  msgInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") sendMessage();
  });
}

/* ====== Příjem zpráv (všechny klienty) ====== */
if(chatBox){
  onChildAdded(ref(db, "messages"), (snap) => {
    const m = snap.val();
    if(!m) return;
    const wrapper = document.createElement("div");
    wrapper.className = "msg";
    // Zobrazit bublinu (zachová design z CSS .bubble/.time)
    wrapper.innerHTML = `
      <div class="bubble">
        <strong>${escapeHtml(m.user)}</strong>: ${escapeHtml(m.text)}
        <div class="time">${escapeHtml(m.time || "")}</div>
      </div>
    `;
    chatBox.appendChild(wrapper);
    // Udržet chat na spodku (ale neexpandovat kontejneru)
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

/* ====== Online přítomnost ====== */
if(onlineList){
  const myRef = ref(db, "online/" + encodeKey(username));
  set(myRef, true).catch(()=>{});
  onDisconnect(myRef).remove();

  onValue(ref(db, "online"), (snap) => {
    onlineList.innerHTML = "";
    snap.forEach(child => {
      const li = document.createElement("li");
      li.textContent = decodeKey(child.key);
      onlineList.appendChild(li);
    });
  });
}

/* ====== Pomocné funkce ====== */
function escapeHtml(str){
  if(!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function encodeKey(s){ return encodeURIComponent(s).replace(/\./g, "%2E"); }
function decodeKey(k){ try { return decodeURIComponent(k); } catch(e){ return k; } }

/* ====== Exponuj jednoduché API pro ostatní skripty =====
   - pokud jiný skript (např. script.js) chce poslat zprávu:
     import { sendMessage } from './chat.js'  (pokud modul používá import)
   - nebo zavolej window._chatSend() z non-module scriptů (pokud chceš)
*/
window._chatSend = sendMessage;
