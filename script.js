// Sušenka Web — Cookie Clicker s upgradem 🍪
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sušenka Web ready ✨");

  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  const upgradeBtn = document.getElementById("upgrade");
  const upgradeInfo = document.getElementById("upgradeInfo");

  let count = parseInt(localStorage.getItem("count")) || 0;
  let autoClick = parseInt(localStorage.getItem("autoClick")) || 0;
  let upgradeCost = parseInt(localStorage.getItem("upgradeCost")) || 50;

  if (countDisplay) countDisplay.textContent = count;

  // 🍪 Kliknutí na sušenku
  if (cookie) {
    cookie.addEventListener("click", () => {
      count++;
      countDisplay.textContent = count;
      localStorage.setItem("count", count);
      cookie.style.transform = "scale(0.9) rotate(-4deg)";
      setTimeout(() => (cookie.style.transform = ""), 100);
    });
  }

  // 💾 Uložení / reset / export / import
  window.saveGame = function () {
    localStorage.setItem("count", count);
    localStorage.setItem("autoClick", autoClick);
    localStorage.setItem("upgradeCost", upgradeCost);
    alert("💾 Hra byla uložena!");
  };

  window.resetGame = function () {
    if (confirm("Opravdu chceš resetovat hru?")) {
      count = 0;
      autoClick = 0;
      upgradeCost = 50;
      localStorage.setItem("count", count);
      localStorage.setItem("autoClick", autoClick);
      localStorage.setItem("upgradeCost", upgradeCost);
      countDisplay.textContent = count;
      if (upgradeInfo) upgradeInfo.textContent = "Cena upgradu: 50 🍪";
    }
  };

  window.exportGame = function () {
    const data = JSON.stringify({ count, autoClick, upgradeCost });
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
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          count = parseInt(data.count) || 0;
          autoClick = parseInt(data.autoClick) || 0;
          upgradeCost = parseInt(data.upgradeCost) || 50;
          localStorage.setItem("count", count);
          localStorage.setItem("autoClick", autoClick);
          localStorage.setItem("upgradeCost", upgradeCost);
          countDisplay.textContent = count;
          if (upgradeInfo)
            upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;
          alert("📥 Data načtena!");
        } catch {
          alert("❌ Neplatný soubor!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 💎 Upgrade systém — automatické klikání
  if (upgradeBtn && upgradeInfo) {
    upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;

    upgradeBtn.addEventListener("click", () => {
      if (count >= upgradeCost) {
        count -= upgradeCost;
        autoClick++;
        upgradeCost = Math.round(upgradeCost * 1.6);
        countDisplay.textContent = count;
        upgradeInfo.textContent = `Cena upgradu: ${upgradeCost} 🍪`;

        localStorage.setItem("count", count);
        localStorage.setItem("autoClick", autoClick);
        localStorage.setItem("upgradeCost", upgradeCost);

        alert(`💫 Zakoupen upgrade! Automatický klik level ${autoClick}`);
      } else {
        alert("❌ Nemáš dost sušenek!");
      }
    });

    // ⏱️ Automatické klikání každou sekundu
    setInterval(() => {
      if (autoClick > 0) {
        count += autoClick;
        countDisplay.textContent = count;
        localStorage.setItem("count", count);
      }
    }, 1000);
  }
});
