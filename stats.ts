// Элементы DOM
const avgTimeDisplay = document.getElementById('avg-time') as HTMLSpanElement;
const minTimeDisplay = document.getElementById('min-time') as HTMLSpanElement;
const maxTimeDisplay = document.getElementById('max-time') as HTMLSpanElement;
const maxComboDisplay = document.getElementById('max-combo') as HTMLSpanElement;
const gamesPlayedDisplay = document.getElementById('games-played') as HTMLSpanElement;
const clearStatsButton = document.getElementById('clear-stats') as HTMLButtonElement;
const clearStatsModal = document.getElementById('clear-stats-modal') as HTMLDivElement;
const confirmClearButton = document.getElementById('confirm-clear') as HTMLButtonElement;
const cancelClearButton = document.getElementById('cancel-clear') as HTMLButtonElement;

async function updateStats(): Promise<void> {
    await (window as any).loadStats();
    const stats = (window as any).stats;
    gamesPlayedDisplay.textContent = stats.gamesPlayed.toString();
    maxComboDisplay.textContent = stats.maxCombo.toString();

    if (stats.times.length === 0) {
        avgTimeDisplay.textContent = '0.0';
        minTimeDisplay.textContent = '0.0';
        maxTimeDisplay.textContent = '0.0';
    } else {
        const avgTime = stats.times.reduce((sum: number, time: number) => sum + time, 0) / stats.times.length;
        const minTime = Math.min(...stats.times);
        const maxTime = Math.max(...stats.times);

        avgTimeDisplay.textContent = avgTime.toFixed(1);
        minTimeDisplay.textContent = minTime.toFixed(1);
        maxTimeDisplay.textContent = maxTime.toFixed(1);
    }
}

async function clearStats(): Promise<void> {
    (window as any).stats = { gamesPlayed: 0, maxCombo: 0, times: [] };
    await (window as any).saveStats();
    await updateStats();
    console.log('Статистика очищена');
}

function showClearModal(): void {
    clearStatsModal.style.display = 'flex';
}

function hideClearModal(): void {
    clearStatsModal.style.display = 'none';
}

async function initStats(): Promise<void> {
    await updateStats();
    clearStatsButton.addEventListener('click', showClearModal);
    confirmClearButton.addEventListener('click', async () => {
        await clearStats();
        hideClearModal();
    });
    cancelClearButton.addEventListener('click', hideClearModal);
}

initStats();