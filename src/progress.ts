export const createProgress = (): void => {
  const progressContainer = document.createElement("div");
  progressContainer.classList.add("progress-container");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");

  const fire = document.createElement("div");
  fire.classList.add("fire");

  const fireTruck = document.createElement("div");
  fireTruck.classList.add("fire-truck");

  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(fire);
  progressContainer.appendChild(fireTruck);

  document.getElementById("progressZone")?.appendChild(progressContainer);
};

export const deleteProgress = (): void => {
  const progressContainer = document.querySelector<HTMLDivElement>(
    ".progress-container"
  );
  if (!progressContainer) return;

  progressContainer.remove();
};

export const updateProgress = (turn: number, maxTurns: number): void => {
  const progressBar = document.querySelector<HTMLDivElement>(".progress-bar");
  const fireTruck = document.querySelector<HTMLDivElement>(".fire-truck");

  if (!progressBar || !fireTruck) return;

  const progressPercentage = (turn / maxTurns) * 100;
  const progressWidth = progressBar.offsetWidth;
  const fireTruckWidth = fireTruck.offsetWidth;
  const newLeft = (progressPercentage / 100) * (progressWidth - fireTruckWidth);

  fireTruck.style.left = `${newLeft}px`;
};
