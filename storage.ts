interface Stats {
    gamesPlayed: number;
    maxCombo: number;
    times: number[];
}

// Глобальная переменная для статистики
(window as any).stats = { gamesPlayed: 0, maxCombo: 0, times: [] };

// Инициализация IndexedDB
const dbPromise = indexedDB.open('DrawPatStats', 1);
let db: IDBDatabase;

dbPromise.onupgradeneeded = (event) => {
    db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore('stats', { keyPath: 'id' });
};

dbPromise.onsuccess = (event) => {
    db = (event.target as IDBOpenDBRequest).result;
    (window as any).loadStats();
};

dbPromise.onerror = (event) => {
    console.error('Ошибка IndexedDB:', event);
};

// Функции как глобальные
(window as any).loadStats = async function(): Promise<void> {
    if (!db) {
        await new Promise<void>((resolve) => {
            dbPromise.onsuccess = (event) => {
                db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
        });
    }
    const transaction = db.transaction(['stats'], 'readonly');
    const store = transaction.objectStore('stats');
    const request = store.get('gameStats');
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            (window as any).stats = request.result?.value || { gamesPlayed: 0, maxCombo: 0, times: [] };
            console.log('Статистика загружена:', (window as any).stats);
            resolve();
        };
        request.onerror = () => {
            console.error('Ошибка загрузки статистики');
            reject();
        };
    });
};

(window as any).saveStats = async function(): Promise<void> {
    if (!db) {
        await new Promise<void>((resolve) => {
            dbPromise.onsuccess = (event) => {
                db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
        });
    }
    const transaction = db.transaction(['stats'], 'readwrite');
    const store = transaction.objectStore('stats');
    const request = store.put({ id: 'gameStats', value: (window as any).stats });
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            console.log('Статистика сохранена:', (window as any).stats);
            resolve();
        };
        request.onerror = () => {
            console.error('Ошибка сохранения статистики');
            reject();
        };
    });
};