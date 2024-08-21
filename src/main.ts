import { startGame } from "./game.ts";
import "./style.css";

document.getElementById("banner")!.innerHTML = `
  <button id="startGame">Démarrer le jeu</button>
`;

document
  .getElementById("startGame")
  ?.addEventListener("click", () => startGame());
