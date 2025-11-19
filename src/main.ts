import { startGame } from "./game.ts";
import "./style.css";
import firehouses from "./assets/firehouses.json";

const banner = document.getElementById("banner");

if (banner) {
  const selectOptions = firehouses
    .map((f) => `<option value="${f.name}">${f.name}</option>`)
    .join("");

  banner.innerHTML = `
    <div id="start-container">
      <label for="town-select">Choisis ton secteur</label>
      <select name="town" id="town-select">
        <option value="">--Merci de choisir votre secteur--</option>
        ${selectOptions}
      </select>
      <button id="startGame">Démarrer le jeu</button>
    </div>
  `;

  document.getElementById("startGame")?.addEventListener("click", () => {
    const select = document.getElementById("town-select") as HTMLSelectElement;
    const value = select.value;
    if (value) {
      document.getElementById("start-container")?.classList.add("hidden");
      startGame(value);
    } else {
      alert("Veuillez sélectionner un secteur");
    }
  });
}



