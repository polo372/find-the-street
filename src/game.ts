import { Map } from "leaflet";
import {
  calculateDistanceToStreetOrLandmark,
  createMap,
  deleteMap,
  displayClickPoint,
  drawStreet,
  getPolygonCenter,
} from "./map";
import {
  deleteStreet,
  displayStreet,
  getCenterMapPoint,
  getRandomStreets,
  initializeStreetForCity,
  Street,
} from "./street";
import { createProgress, deleteProgress, updateProgress } from "./progress";

const options = {
  maxTurns: 10,
  maxTime: 45,
  firehouseName: "Ouest Agglo",
  lat: 0,
  long: 0,
};
let score = 0;
let streetsToFind: Street[] = [];

export const startGame = async (): Promise<void> => {
  // Initialize game variables
  score = 0;
  streetsToFind = [];

  deleteStartButton();
  await initializeStreetForCity(options.firehouseName);
  streetsToFind = getRandomStreets(options.maxTurns);
  console.log(streetsToFind);

  const polygonPoints = getCenterMapPoint(streetsToFind);
  if (!polygonPoints) {
    console.error("No polygon points found");
    alert("Erreur lors de la récupération des rues");
    return;
  }
  const center = getPolygonCenter(polygonPoints);
  options.lat = center.lat;
  options.long = center.lng;

  deleteScore();
  deleteFinalScore();

  createProgress();
  nextTurn();
};

const createStartButton = (): void => {
  const startButton = document.createElement("button");
  startButton.innerHTML = "Démarrer le jeu";
  startButton.setAttribute("id", "startGame");
  document.getElementById("app")?.append(startButton);
  startButton.addEventListener("click", () => startGame());
};
const deleteStartButton = (): void => {
  document.getElementById("startGame")?.remove();
};

const nextTurn = (): void => {
  deleteStreet();
  deleteMap();
  deleteTimer();
  deleteTurnResult();

  const street = streetsToFind.shift();
  if (street) {
    displayStreet(street);
    const map = createMap(options.lat, options.long);
    const timer = startTimer(map, street);
    map.on("dblclick", (event) => {
      map.off("dblclick");
      clearInterval(timer);
      checkAnswer(map, street, event);
    });
  } else {
    endGame();
  }
};

const deleteTurnResult = (): void => {
  document.getElementById("result")?.remove();
};

export const endGame = (): void => {
  deleteMap();
  deleteStreet();
  deleteTimer();
  deleteTurnResult();
  deleteProgress();
  deleteScore();
  displayFinalScore();
  createStartButton();
};

export const displayScore = () => {
  deleteScore();
  const scoreDiv = document.createElement("div");
  scoreDiv.innerHTML = `Score: ${score}`;
  scoreDiv.setAttribute("id", "score");
  document.getElementById("app")?.append(scoreDiv);
};
const deleteScore = (): void => {
  document.getElementById("score")?.remove();
};

const startTimer = (map: Map, street: Street): NodeJS.Timeout => {
  deleteTimer();
  let timeLeft = options.maxTime;
  const timer = document.createElement("div");
  timer.innerHTML = `Temps restant: ${timeLeft}`;
  timer.setAttribute("id", "timer");
  document.getElementById("app")?.append(timer);

  const interval = setInterval(() => {
    timeLeft--;
    timer.innerHTML = `Temps restant: ${timeLeft}`;
    if (timeLeft === 0) {
      clearInterval(interval);
      checkAnswer(map, street);
    }
  }, 1000);
  return interval;
};

const deleteTimer = (): void => {
  document.getElementById("timer")?.remove();
};

const checkAnswer = (
  map: Map,
  street?: Street,
  event?: L.LeafletMouseEvent
): void => {
  if (!event) {
    displayTimeoutTurnResult();
  } else if (street) {
    displayClickPoint(event, map);
    const latlng = event.latlng;
    // const isCorrect = checkIfCorrect(latlng, street, map);
    const distance = calculateDistanceToStreetOrLandmark(latlng, street, map);
    const isCorrect = distance <= 50;
    const points = calculatePoints(distance, isCorrect);
    score += points;
    displayTurnResult(isCorrect, distance);
  }
  if (street) {
    showCorrectPosition(street, map);
    displayScore();
    updateProgress(options.maxTurns - streetsToFind.length, options.maxTurns);
    if (streetsToFind.length === 0) {
      displayEndGame();
    } else {
      displayNextQuestion();
    }
  }
};

const displayTimeoutTurnResult = (): void => {
  deleteTurnResult();
  const result = document.createElement("div");
  result.setAttribute("id", "result");
  result.innerHTML = "Temps écoulé!";
  document.getElementById("app")?.append(result);
};
const displayTurnResult = (isCorrect: boolean, distance: number): void => {
  deleteTurnResult();
  const result = document.createElement("div");
  result.setAttribute("id", "result");
  if (isCorrect) {
    result.innerHTML = "Correct! Bien joué!";
  } else {
    result.innerHTML = `Incorrect! La rue ou lieu se trouve à environ ${Math.round(
      distance
    )} mètres d'ici.`;
  }
  document.getElementById("app")?.append(result);
};

const displayEndGame = () => {
  const endGameButton = document.createElement("button");
  endGameButton.innerHTML = "Terminer le jeu";
  endGameButton.setAttribute("id", "endGame");
  document.getElementById("app")?.append(endGameButton);
  endGameButton.addEventListener("click", () => {
    endGameButton.remove();
    endGame();
  });
};

const displayNextQuestion = () => {
  const nextButton = document.createElement("button");
  nextButton.innerHTML = "Continuer avec la rue suivante";
  nextButton.setAttribute("id", "nextQuestion");
  document.getElementById("app")?.append(nextButton);
  nextButton.addEventListener("click", () => {
    nextButton.remove();
    nextTurn();
  });
};

const displayFinalScore = () => {
  const finalScore = document.createElement("div");
  finalScore.setAttribute("id", "finalScore");
  finalScore.innerHTML = `Votre score final est de ${score} points`;
  document.getElementById("app")?.append(finalScore);
};
const deleteFinalScore = () => {
  document.getElementById("finalScore")?.remove();
};

const showCorrectPosition = (street: Street, map: Map) => {
  drawStreet(street, map);
};

const calculatePoints = (distance: number, isCorrect: boolean) => {
  const maxPoints = 100;
  if (isCorrect) return maxPoints;
  if (distance > 750) {
    return 0;
  }
  const points = Math.round(maxPoints * (1 - distance / 750));
  return points;
};
