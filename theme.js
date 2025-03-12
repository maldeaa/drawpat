"use strict";
const themes = {
    darkTheme: 'dark-theme',
    lightTheme: 'light-theme'
};
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
// Функция для обновления иконки темы
function updateIcon(theme) {
    if (!themeIcon)
        return;
    themeIcon.classList.remove('fas', 'fa-moon', 'fa-sun');
    themeIcon.classList.add('fas', theme === themes.darkTheme ? 'fa-sun' : 'fa-moon');
}
// Функция для применения сохранённой темы
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    body.classList.remove(themes.darkTheme, themes.lightTheme);
    if (savedTheme === themes.darkTheme) {
        body.classList.add(themes.darkTheme);
    }
    else {
        body.classList.add(themes.lightTheme);
        localStorage.setItem('theme', themes.lightTheme); // Устанавливаем по умолчанию светлую
    }
    updateIcon(savedTheme || themes.lightTheme);
}
// Функция для переключения темы
function toggleTheme() {
    if (body.classList.contains(themes.darkTheme)) {
        body.classList.remove(themes.darkTheme);
        body.classList.add(themes.lightTheme);
        localStorage.setItem('theme', themes.lightTheme);
    }
    else {
        body.classList.remove(themes.lightTheme);
        body.classList.add(themes.darkTheme);
        localStorage.setItem('theme', themes.darkTheme);
    }
    updateIcon(body.classList.contains(themes.darkTheme) ? themes.darkTheme : themes.lightTheme);
}
// Применяем тему сразу
applySavedTheme();
// Добавляем обработчик для кнопки
themeToggle === null || themeToggle === void 0 ? void 0 : themeToggle.addEventListener('click', toggleTheme);
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});
