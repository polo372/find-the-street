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
      <label for="difficulty-select">Difficulté</label>
      <select name="difficulty" id="difficulty-select">
        <option value="easy">Facile (Grands axes)</option>
        <option value="medium" selected>Moyen (Intermédiaire)</option>
        <option value="hard">Difficile (Toutes les rues)</option>
      </select>
      <button id="startGame">Démarrer le jeu</button>
    </div>
  `;

  document.getElementById("startGame")?.addEventListener("click", () => {
    const select = document.getElementById("town-select") as HTMLSelectElement;
    const value = select.value;
    const difficultySelect = document.getElementById(
      "difficulty-select"
    ) as HTMLSelectElement;
    const difficulty = difficultySelect.value;
    if (value) {
      document.getElementById("start-container")?.classList.add("hidden");
      startGame(value, difficulty);
    } else {
      alert("Veuillez sélectionner un secteur");
    }
  });
}



