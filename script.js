// script.js – Sušenka Web V5 (opravená verze)

// 🔹 Ověření načtení skriptu
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js byl načten úspěšně!");
});

// 🔹 Bezpečnostní fallback (pokud se něco nepodaří)
window.onerror = function (message, source, lineno, colno, error) {
  alert("Chyba: script.js se nenačetl!");
  console.error("Chyba v script.js:", message, "na řádku", lineno);
};

// 🔹 Cookie Clicker logika (pouze pokud existuje element #cookie)
document.addEventListener("DOMContentLoaded", () => {
  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");

  if (!cookie || !countDisplay) return; // pokud to není hra.html

  let count = parseInt(localStorage.getItem("count")) || 0;
  countDisplay.textContent = count;

  // Kliknutí na sušenku
  cookie.addEventListener("click", () => {
    count++;
    countDisplay.textContent = count;
    localStorage.setItem("count", count);
  });

  // Funkce ovládacích tlačítek
  window.saveGame = function () {
    localStorage.setItem("count", count);
    alert("✅ Hra byla uložena!");
  };

  window.resetGame = function () {
    if (confirm("Opravdu chceš hru resetovat?")) {
      count = 0;
      countDisplay.textContent = count;
      localStorage.setItem("count", count);
      alert("🔁 Hra byla resetována!");
    }
  };

  window.exportGame = function () {
    const data = JSON.stringify({ count });
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "susenka-save.json";
    a.click();
  };

  window.importGame = function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          count = data.count || 0;
          localStorage.setItem("count", count);
          countDisplay.textContent = count;
          alert("📥 Data byla importována!");
        } catch {
          alert("❌ Chyba: Soubor je neplatný!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
});
