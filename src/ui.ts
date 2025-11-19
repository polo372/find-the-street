import confetti from "canvas-confetti";

export const showTurnResult = (
    isCorrect: boolean,
    distance: number,
    points: number,
    onNext: () => void
) => {
    const overlay = document.createElement("div");
    overlay.className = "result-overlay";

    const modal = document.createElement("div");
    modal.className = `result-modal ${isCorrect ? "correct" : "incorrect"}`;

    const title = document.createElement("h2");
    title.textContent = isCorrect ? "Excellent !" : "Pas tout à fait...";

    const message = document.createElement("p");
    if (isCorrect) {
        message.innerHTML = `Vous avez trouvé l'emplacement exact !<br>+${points} points`;
    } else if (distance === 0 && points === 0) {
        message.innerHTML = `Temps écoulé !<br>+${points} points`;
    } else {
        message.innerHTML = `Vous étiez à <strong>${Math.round(
            distance
        )}m</strong>.<br>+${points} points`;
    }

    const button = document.createElement("button");
    button.textContent = "Continuer";
    button.onclick = () => {
        overlay.remove();
        onNext();
    };

    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
};

export const triggerConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};
