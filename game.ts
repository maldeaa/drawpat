interface Dot {
    element: HTMLDivElement;
    x: number;
    y: number;
    id: string;
}

// Элементы DOM
const patternContainer = document.getElementById('pattern') as HTMLDivElement;
const lockContainer = document.getElementById('lock') as HTMLDivElement;
const timerDisplay = document.getElementById('timer') as HTMLSpanElement;
const comboDisplay = document.getElementById('combo') as HTMLSpanElement;
//const resetButton = document.getElementById('reset') as HTMLButtonElement;
const gameOverModal = document.getElementById('game-over-modal') as HTMLDivElement;
const gameOverMessage = document.getElementById('game-over-message') as HTMLParagraphElement;
const modalTimer = document.getElementById('modal-timer') as HTMLSpanElement;
const modalCombo = document.getElementById('modal-combo') as HTMLSpanElement;
const retryButton = document.getElementById('modal-retry') as HTMLButtonElement;

// Canvas элементы
const patternCanvas = document.createElement('canvas') as HTMLCanvasElement;
const patternCtx = patternCanvas.getContext('2d') as CanvasRenderingContext2D;
patternContainer.appendChild(patternCanvas);
patternCanvas.width = patternContainer.offsetWidth;
patternCanvas.height = patternContainer.offsetHeight;

const lockCanvas = document.createElement('canvas') as HTMLCanvasElement;
const lockCtx = lockCanvas.getContext('2d') as CanvasRenderingContext2D;
lockContainer.appendChild(lockCanvas);
lockCanvas.width = lockContainer.offsetWidth;
lockCanvas.height = lockCanvas.offsetHeight;

// Константы и переменные
const gridSize: number = 3;
const spacing: number = lockContainer.offsetWidth / (gridSize + 1);
const dots: Dot[] = [];
let targetPattern: Dot[] = [];
let userPath: Dot[] = [];
let isDrawing: boolean = false;
let currentLine: [number, number] | [] = [];
let timer: number = 0;
let timerInterval: number | null = null;
let combo: number = 0;
let isChecking: boolean = false;

// Инициализация точек
for (let i = 1; i <= gridSize; i++) {
    for (let j = 1; j <= gridSize; j++) {
        const dot = document.createElement('div') as HTMLDivElement;
        dot.classList.add('dot');
        dot.style.left = `${j * spacing - 10}px`;
        dot.style.top = `${i * spacing - 10}px`;
        dot.dataset.id = `${i - 1}${j - 1}`;
        lockContainer.appendChild(dot);
        dots.push({
            element: dot,
            x: j * spacing,
            y: i * spacing,
            id: dot.dataset.id,
        });

        const patternDot = document.createElement('div') as HTMLDivElement;
        patternDot.classList.add('dot');
        patternDot.style.left = `${j * spacing - 5}px`;
        patternDot.style.top = `${i * spacing - 5}px`;
        patternDot.dataset.id = `${i - 1}${j - 1}`;
        patternContainer.appendChild(patternDot);
    }
}

function generatePattern(): void {
    targetPattern = [];
    const usedIds = new Set<string>();
    const patternLength: number = Math.floor(Math.random() * 4) + 4;

    let previousDot: Dot | null = null;
    for (let i = 0; i < patternLength; i++) {
        let randomDot: Dot;
        let attempts = 0;
        do {
            randomDot = dots[Math.floor(Math.random() * dots.length)];
            attempts++;
            if (attempts > 100) {
                console.log("Не удалось сгенерировать паттерн, сброс...");
                return generatePattern();
            }
        } while (usedIds.has(randomDot.id) || (previousDot && !isConnectable(previousDot, randomDot)));
        usedIds.add(randomDot.id);
        targetPattern.push(randomDot);
        previousDot = randomDot;
    }

    if (Math.random() > 0.5) {
        const extraDot = dots.find((dot) => !usedIds.has(dot.id));
        if (extraDot) {
            targetPattern.splice(Math.floor(targetPattern.length / 2), 0, extraDot);
        }
    }

    drawPattern();
}

function isConnectable(dot1: Dot, dot2: Dot): boolean {
    const dx = Math.abs(dot1.x - dot2.x);
    const dy = Math.abs(dot1.y - dot2.y);
    return (
        (dx <= spacing && dy === 0) ||
        (dy <= spacing && dx === 0) ||
        (dx <= spacing && dy <= spacing)
    );
}

function drawPattern(): void {
    console.log('Drawing pattern...');
    patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
    patternCtx.strokeStyle = '#007bff';
    patternCtx.lineWidth = 2;

    patternCtx.beginPath();
    for (let i = 0; i < targetPattern.length - 1; i++) {
        patternCtx.moveTo(targetPattern[i].x, targetPattern[i].y);
        patternCtx.lineTo(targetPattern[i + 1].x, targetPattern[i + 1].y);
    }
    patternCtx.stroke();

    const patternDots = patternContainer.querySelectorAll('.dot') as NodeListOf<HTMLDivElement>;
    patternDots.forEach((dot) => dot.classList.remove('pattern-point', 'start', 'end'));

    targetPattern.forEach((targetDot) => {
        patternDots.forEach((dot) => {
            if (dot.dataset.id === targetDot.id) {
                dot.classList.add('pattern-point');
            }
        });
    });

    patternDots.forEach((dot) => {
        if (dot.dataset.id === targetPattern[0].id) dot.classList.add('start');
        if (dot.dataset.id === targetPattern[targetPattern.length - 1].id) dot.classList.add('end');
    });

    console.log('Pattern drawn:', targetPattern.map((p) => p.id));
}

function drawLines(): void {
    lockCtx.clearRect(0, 0, lockCanvas.width, lockCanvas.height);
    lockCtx.strokeStyle = '#007bff';
    lockCtx.lineWidth = 4;

    lockCtx.beginPath();
    for (let i = 0; i < userPath.length - 1; i++) {
        lockCtx.moveTo(userPath[i].x, userPath[i].y);
        lockCtx.lineTo(userPath[i + 1].x, userPath[i + 1].y);
    }
    lockCtx.stroke();

    if (currentLine.length > 0) {
        lockCtx.beginPath();
        lockCtx.moveTo(userPath[userPath.length - 1].x, userPath[userPath.length - 1].y);
        lockCtx.lineTo(currentLine[0]!, currentLine[1]!);
        lockCtx.stroke();
    }
}

function startDrawing(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    console.log('Start drawing triggered');
    if (!isDrawing && !isChecking) {
        userPath = [];
        currentLine = [];
        dots.forEach((dot) => dot.element.classList.remove('active', 'start', 'end'));
        lockCtx.clearRect(0, 0, lockCanvas.width, lockCanvas.height);
        if (timerInterval !== null) clearInterval(timerInterval);
        timer = 0;
        timerInterval = setInterval(() => {
            timer += 0.1;
            timerDisplay.textContent = timer.toFixed(1);
        }, 100);
        isDrawing = true;
        (window as any).stats.gamesPlayed++;
        checkDot(e);
    }
}

function draw(e: MouseEvent | TouchEvent): void {
    if (!isDrawing) return;
    e.preventDefault();
    const rect = lockContainer.getBoundingClientRect();
    const x = (e instanceof TouchEvent ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e instanceof TouchEvent ? e.touches[0].clientY : e.clientY) - rect.top;
    currentLine = [x, y];
    drawLines();
    checkDot(e);
}

function stopDrawing(): void {
    if (!isDrawing) return;
    console.log('Stop drawing triggered');
    isDrawing = false;
    currentLine = [];
    drawLines();

    if (userPath.length > 0) {
        const lastDot = userPath[userPath.length - 1];
        lastDot.element.classList.add('end');
    }

    if (!isChecking) {
        isChecking = true;
        setTimeout(() => {
            checkPattern();
            isChecking = false;
        }, 100);
    }
}

function checkDot(e: MouseEvent | TouchEvent): void {
    const rect = lockContainer.getBoundingClientRect();
    const x = (e instanceof TouchEvent ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e instanceof TouchEvent ? e.touches[0].clientY : e.clientY) - rect.top;

    dots.forEach((dot) => {
        const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
        if (distance < 20 && !userPath.some((p) => p.id === dot.id)) {
            dot.element.classList.add('active');
            if (userPath.length === 0) {
                dot.element.classList.add('start');
            }
            userPath.push(dot);
            drawLines();
        }
    });

    if (!isDrawing && userPath.length > 0) {
        const lastDot = userPath[userPath.length - 1];
        lastDot.element.classList.add('end');
    }
}

function checkPattern(): void {
    console.log('Checking pattern...');
    if (userPath.length === 0) {
        console.log('No input to check, skipping...');
        return;
    }

    const userIds = userPath.map((p) => p.id);
    const targetIds = targetPattern.map((p) => p.id);
    const targetIdsReversed = targetPattern.slice().reverse().map((p) => p.id);

    function isValidSequence(userSequence: string[], targetSequence: string[]): boolean {
        if (userSequence.length !== targetSequence.length) return false;
        return userSequence.join('') === targetSequence.join('');
    }

    if (timerInterval !== null) clearInterval(timerInterval);
    timerInterval = null;

    console.log('User:', userIds.join(''), 'Target:', targetIds.join(''), 'Target Reversed:', targetIdsReversed.join(''));
    console.log('Start Correct:', userIds[0] === targetIds[0] || userIds[0] === targetIds[targetIds.length - 1]);
    console.log('End Correct:', userIds[userIds.length - 1] === targetIds[targetIds.length - 1] || userIds[userIds.length - 1] === targetIds[0]);
    console.log('Forward Valid:', isValidSequence(userIds, targetIds));
    console.log('Reverse Valid:', isValidSequence(userIds, targetIdsReversed));

    const isStartCorrect = userIds[0] === targetIds[0] || userIds[0] === targetIds[targetIds.length - 1];
    const isEndCorrect = userIds[userIds.length - 1] === targetIds[targetIds.length - 1] || userIds[userIds.length - 1] === targetIds[0];
    const isForwardValid = isValidSequence(userIds, targetIds);
    const isReverseValid = isValidSequence(userIds, targetIdsReversed);

    lockContainer.classList.remove('success', 'failure');

    if (isStartCorrect && isEndCorrect && (isForwardValid || isReverseValid)) {
        lockContainer.classList.add('success');
        combo++;
        comboDisplay.textContent = combo.toString();
        setTimeout(() => {
            patternContainer.classList.add('fade-out');
            setTimeout(() => {
                resetSuccess();
                patternContainer.classList.remove('fade-out');
            }, 500);
        }, 500);
    } else {
        lockContainer.classList.add('failure');
        setTimeout(() => {
            let message: string;
            if (combo <= 5) {
                message = "Ничего страшного, вы только разгонялись!";
            } else if (combo <= 10) {
                message = "Не переживайте, каждый шаг делает вас лучше!";
            } else if (combo <= 15) {
                message = "Отличный результат, вы стали сильнее!";
            } else {
                message = "Вы настоящий мастер, небольшая пауза перед новым рывком!";
            }
            gameOverMessage.textContent = message;
            modalTimer.textContent = timer.toFixed(1);
            modalCombo.textContent = combo.toString();
            gameOverModal.style.display = 'flex';
            lockContainer.style.pointerEvents = 'none';
            combo = 0;
            comboDisplay.textContent = combo.toString();
            resetGame();
        }, 500);
    }
}

async function resetSuccess(): Promise<void> {
    console.log('Resetting after success...');
    isDrawing = false;
    isChecking = false;
    userPath = [];
    currentLine = [0, 0];

    (window as any).stats.times.push(timer);
    (window as any).stats.maxCombo = Math.max((window as any).stats.maxCombo, combo);
    await (window as any).saveStats();

    timer = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = '0';
    dots.forEach((dot) => dot.element.classList.remove('active', 'start', 'end'));
    lockCtx.clearRect(0, 0, lockCanvas.width, lockCanvas.height);
    lockContainer.classList.remove('success', 'failure');
    lockContainer.style.pointerEvents = 'auto';
    generatePattern();
    console.log('New pattern generated:', targetPattern.map((p) => p.id));
}

async function resetGame(): Promise<void> {
    console.log('Resetting after failure...');
    isDrawing = false;
    isChecking = false;
    userPath = [];
    currentLine = [0, 0];

    (window as any).stats.maxCombo = Math.max((window as any).stats.maxCombo, combo);
    await (window as any).saveStats();

    timer = 0;
    combo = 0;
    comboDisplay.textContent = combo.toString();
    timerInterval = null;
    timerDisplay.textContent = '0';
    dots.forEach((dot) => dot.element.classList.remove('active', 'start', 'end'));
    lockCtx.clearRect(0, 0, lockCanvas.width, lockCanvas.height);
    lockContainer.classList.remove('success', 'failure');
    lockContainer.style.pointerEvents = 'auto';
    generatePattern();
    console.log('New pattern generated:', targetPattern.map((p) => p.id));
}

function bindEvents(): void {
    lockContainer.addEventListener('mousedown', (e: MouseEvent) => {
        console.log('Mouse down event');
        startDrawing(e);
    });
    lockContainer.addEventListener('touchstart', (e: TouchEvent) => {
        console.log('Touch start event');
        startDrawing(e);
    });
    lockContainer.addEventListener('mousemove', draw);
    lockContainer.addEventListener('touchmove', draw);
    lockContainer.addEventListener('mouseup', stopDrawing);
    lockContainer.addEventListener('touchend', stopDrawing);
    //resetButton.addEventListener('click', resetGame);
    retryButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        resetGame();
    });
}

async function initGame(): Promise<void> {
    await (window as any).loadStats();
    bindEvents();
    generatePattern();
}

initGame();