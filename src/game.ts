import {
  latLng,
  LatLng,
  latLngBounds,
  Map,
  marker,
  polygon,
  polyline,
} from "leaflet";
import { createMap, deleteMap } from "./map";
import { getRandomStreets, Street } from "./street";
import { createProgress, deleteProgress, updateProgress } from "./progress";

const options = {
  maxTurns: 3,
  maxTime: 45,
};
let score = 0;
let streetsToFind: Street[] = [];

export const startGame = (): void => {
  // Initialize game variables
  score = 0;
  streetsToFind = [];

  deleteScore();
  deleteStartButton();

  streetsToFind = getRandomStreets(options.maxTurns);
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
  deleteScore();
  deleteMap();
  deleteTimer();
  deleteTurnResult();

  const street = streetsToFind.shift();
  if (street) {
    displayStreet(street);
    const map = createMap();
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

const displayStreet = (street: Street): void => {
  deleteStreet();
  const streetDiv = document.createElement("div");
  streetDiv.innerHTML = `Chercher: <span>${street.name}</span>`;
  streetDiv.setAttribute("id", "street");
  document.getElementById("app")?.append(streetDiv);
};
const deleteStreet = (): void => {
  document.getElementById("street")?.remove();
};

const startTimer = (map: Map, street: Street): number => {
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
    const latlng = event.latlng;
    const isCorrect = checkIfCorrect(latlng, street, map);
    const distance = calculateDistanceToStreetOrLandmark(latlng, street, map);
    const points = calculatePoints(distance, isCorrect);
    score += points;
    displayTurnResult(isCorrect, distance);
  }
  if (street) {
    showCorrectPosition(street, map);
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
  finalScore.setAttribute("id", "score");
  finalScore.innerHTML = `Votre score final est de ${score} points`;
  document.getElementById("app")?.append(finalScore);
};

const checkIfCorrect = (latlng: LatLng, street: Street, map: Map) => {
  if (street.type === "landmark") {
    return isPointInPolygon(latlng, street.path);
  } else {
    const nearestPoint = findNearestPointOnPolyline(latlng, street.path, map);
    if (!nearestPoint) {
      console.log(`nearestPoint not found`);
      return false;
    }
    const distance = map.distance(latlng, nearestPoint);
    return distance <= 50;
  }
};

const isPointInPolygon = (point: LatLng, polygonPoints: [number, number][]) => {
  const latlngs = polygonPoints.map((coord) => latLng(coord));
  const poly = polygon(latlngs);
  return poly.getBounds().contains(point);
};

const findNearestPointOnPolyline = (
  latlng: LatLng,
  path: [number, number][],
  map: Map
): [number, number] | null => {
  let nearestPoint = null;
  let nearestDistance = Infinity;
  path.forEach((point) => {
    const distance = map.distance(latlng, point);
    if (distance < nearestDistance) {
      nearestPoint = point;
      nearestDistance = distance;
    }
  });
  return nearestPoint;
};

const showCorrectPosition = (street: Street, map: Map) => {
  drawStreet(street, map);
  if (street.type === "landmark") {
    marker(getPolygonCenter(street.path))
      .addTo(map)
      .bindPopup(`Position correcte: ${street.name}`)
      .openPopup();
  } else {
    const midpointIndex = Math.floor(street.path.length / 2);
    const midpoint = street.path[midpointIndex];
    marker(midpoint)
      .addTo(map)
      .bindPopup(`Position correcte: ${street.name}`)
      .openPopup();
  }
};

const drawStreet = (street: Street, map: Map) => {
  if (street.type === "landmark") {
    // Afficher un polygone pour l'empreinte géographique
    polygon(street.path, { color: "red" }).addTo(map);
  } else {
    // Afficher une polyline pour une rue
    polyline(street.path, { color: "red" }).addTo(map);
  }
};

const getPolygonCenter = (polygonPoints: [number, number][]): LatLng => {
  const bounds = latLngBounds(polygonPoints);
  return bounds.getCenter();
};

const calculateDistanceToStreetOrLandmark = (
  latlng: LatLng,
  street: Street,
  map: Map
) => {
  if (street.type === "landmark") {
    return calculateDistanceToPolygon(latlng, street.path, map);
  } else {
    return calculateDistanceToPolyline(latlng, street.path, map);
  }
};

const calculateDistanceToPolygon = (
  point: LatLng,
  polygon: [number, number][],
  map: Map
) => {
  let minDistance = Infinity;
  polygon.forEach((coord) => {
    const distance = map.distance(point, latLng(coord));
    if (distance < minDistance) {
      minDistance = distance;
    }
  });
  return minDistance;
};

const calculateDistanceToPolyline = (
  point: LatLng,
  polyline: [number, number][],
  map: Map
) => {
  let minDistance = Infinity;
  polyline.forEach((coord) => {
    const distance = map.distance(point, latLng(coord));
    if (distance < minDistance) {
      minDistance = distance;
    }
  });
  return minDistance;
};

const calculatePoints = (distance: number, isCorrect: boolean) => {
  if (isCorrect) return 10;
  if (distance <= 50) return 8;
  if (distance <= 100) return 5;
  if (distance <= 150) return 3;
  if (distance <= 200) return 1;
  return 0;
};
