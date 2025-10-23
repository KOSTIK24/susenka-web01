
// Sušenka Web — modern + animace + opravená hra
document.addEventListener("DOMContentLoaded", () => {
  console.log("Sušenka Web ready ✨");

  const cookie = document.getElementById("cookie");
  const countDisplay = document.getElementById("count");
  if (cookie && countDisplay) {
    let count = parseInt(localStorage.getItem("count")) || 0;
    countDisplay.textContent = count;

    // animovaný klik
    cookie.addEventListener("click", () => {
      count++;
      countDisplay.textContent = count;
      localStorage.setItem("count", count);

      cookie.style.transform = "scale(0.92) rotate(-3deg)";
      setTimeout(() => { cookie.style.transform = ""; }, 90);
    });

    window.saveGame = function () {
      localStorage.setItem("count", count);
      alert("💾 Hra uložena!");
    };
    window.resetGame = function () {
      if (confirm("Opravdu resetovat hru?")) {
        count = 0;
        localStorage.setItem("count", count);
        countDisplay.textContent = count;
      }
    };
    window.exportGame = function () {
      const data = JSON.stringify({ count });
      const blob = new Blob([data], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'susenka-save.json';
      a.click();
    };
    window.importGame = function () {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            count = parseInt(data.count) || 0;
            localStorage.setItem("count", count);
            countDisplay.textContent = count;
            alert("📥 Uložení načteno.");
          } catch (err) {
            alert("❌ Neplatný soubor uložení.");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    };
  }
});
