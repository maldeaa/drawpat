"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Элементы DOM
const avgTimeDisplay = document.getElementById('avg-time');
const minTimeDisplay = document.getElementById('min-time');
const maxTimeDisplay = document.getElementById('max-time');
const maxComboDisplay = document.getElementById('max-combo');
const gamesPlayedDisplay = document.getElementById('games-played');
const clearStatsButton = document.getElementById('clear-stats');
const clearStatsModal = document.getElementById('clear-stats-modal');
const confirmClearButton = document.getElementById('confirm-clear');
const cancelClearButton = document.getElementById('cancel-clear');
function updateStats() {
    return __awaiter(this, void 0, void 0, function* () {
        yield window.loadStats();
        const stats = window.stats;
        gamesPlayedDisplay.textContent = stats.gamesPlayed.toString();
        maxComboDisplay.textContent = stats.maxCombo.toString();
        if (stats.times.length === 0) {
            avgTimeDisplay.textContent = '0.0';
            minTimeDisplay.textContent = '0.0';
            maxTimeDisplay.textContent = '0.0';
        }
        else {
            const avgTime = stats.times.reduce((sum, time) => sum + time, 0) / stats.times.length;
            const minTime = Math.min(...stats.times);
            const maxTime = Math.max(...stats.times);
            avgTimeDisplay.textContent = avgTime.toFixed(1);
            minTimeDisplay.textContent = minTime.toFixed(1);
            maxTimeDisplay.textContent = maxTime.toFixed(1);
        }
    });
}
function clearStats() {
    return __awaiter(this, void 0, void 0, function* () {
        window.stats = { gamesPlayed: 0, maxCombo: 0, times: [] };
        yield window.saveStats();
        yield updateStats();
        console.log('Статистика очищена');
    });
}
function showClearModal() {
    clearStatsModal.style.display = 'flex';
}
function hideClearModal() {
    clearStatsModal.style.display = 'none';
}
function initStats() {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateStats();
        clearStatsButton.addEventListener('click', showClearModal);
        confirmClearButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            yield clearStats();
            hideClearModal();
        }));
        cancelClearButton.addEventListener('click', hideClearModal);
    });
}
initStats();
