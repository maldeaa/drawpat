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
// Глобальная переменная для статистики
window.stats = { gamesPlayed: 0, maxCombo: 0, times: [] };
// Инициализация IndexedDB
const dbPromise = indexedDB.open('DrawPatStats', 1);
let db;
dbPromise.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('stats', { keyPath: 'id' });
};
dbPromise.onsuccess = (event) => {
    db = event.target.result;
    window.loadStats();
};
dbPromise.onerror = (event) => {
    console.error('Ошибка IndexedDB:', event);
};
// Функции как глобальные
window.loadStats = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db) {
            yield new Promise((resolve) => {
                dbPromise.onsuccess = (event) => {
                    db = event.target.result;
                    resolve();
                };
            });
        }
        const transaction = db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        const request = store.get('gameStats');
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                var _a;
                window.stats = ((_a = request.result) === null || _a === void 0 ? void 0 : _a.value) || { gamesPlayed: 0, maxCombo: 0, times: [] };
                console.log('Статистика загружена:', window.stats);
                resolve();
            };
            request.onerror = () => {
                console.error('Ошибка загрузки статистики');
                reject();
            };
        });
    });
};
window.saveStats = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db) {
            yield new Promise((resolve) => {
                dbPromise.onsuccess = (event) => {
                    db = event.target.result;
                    resolve();
                };
            });
        }
        const transaction = db.transaction(['stats'], 'readwrite');
        const store = transaction.objectStore('stats');
        const request = store.put({ id: 'gameStats', value: window.stats });
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('Статистика сохранена:', window.stats);
                resolve();
            };
            request.onerror = () => {
                console.error('Ошибка сохранения статистики');
                reject();
            };
        });
    });
};
