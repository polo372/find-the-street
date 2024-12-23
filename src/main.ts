import { startGame } from "./game.ts";
import "./style.css";

document.getElementById("banner")!.innerHTML = `
  <button id="startGame">Démarrer le jeu</button>
  <label for="town-select">Choisis ton secteur</label>
  <select name="town" id="town-select">
    <option value="">--Merci de choisir votre secteur--</option>
    <option value="Ouest Agglo">Ouest Agglo</option>
    <option value="Tours centre">Tours Centre</option>
  </select>
`;

document
  .getElementById("startGame")
  ?.addEventListener("click", () => startGame());

  

