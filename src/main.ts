import { startGame } from "./game.ts";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1>Trouve ma rue!</h1>
  <button id="startGame">Démarrer le jeu</button>
`;

document
  .getElementById("startGame")
  ?.addEventListener("click", () => startGame());
