// 🔥 Sušenka Web – hlavní script
console.log("🔥 Sušenka Web – script načten");

// ===== Firebase konfigurace =====
const firebaseConfig = {
  apiKey: "AIzaSyCKHgsrhvBqciDCd03r4ukddxIxP95m94",
  authDomain: "susenka-web-chat.firebaseapp.com",
  databaseURL: "https://susenka-web-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "susenka-web-chat",
  storageBucket: "susenka-web-chat.appspot.com",
  messagingSenderId: "625704029177",
  appId: "1:625704029177:web:d8510c07f534df48134b28"
};

// ===== Init Firebase (jen jednou) =====
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase inicializován");
}

// ===== Po načtení DOM =====
document.addEventListener("DOMContentLoaded", () => {
  initLeaderboard();
});

// ===== LEADERBOARD (VARIANTA A) =====
function initLeaderboard() {
  const leaderboardEl = document.getElementById("leaderboard");
  if (!leaderboardEl) {
    console.log("ℹ️ Leaderboard element nenalezen – stránka ho nemá");
    return;
  }

  console.log("🏆 Načítám leaderboard…");

  firebase.database().ref("leaderboard").on("value", (snapshot) => {
    leaderboardEl.innerHTML = "";

    if (!snapshot.exists()) {
      leaderboardEl.innerHTML = "<li>Žádná data</li>";
      return;
    }

    const data = [];

    snapshot.forEach((child) => {
      data.push({
        name: child.key,
        cookies: child.val().cookies || 0
      });
    });

    // seřadit podle cookies
    data.sort((a, b) => b.cookies - a.cookies);

    data.forEach((player, i) => {
      const li = document.createElement("li");
      const medal =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" : "🏅";

      li.innerHTML = `
        <span>${medal} ${player.name}</span>
        <span>${player.cookies} 🍪</span>
      `;
      leaderboardEl.appendChild(li);
    });

    console.log("✅ Leaderboard aktualizován");
  });
}
