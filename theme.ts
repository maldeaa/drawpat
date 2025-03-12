interface Theme {
    darkTheme: string;
    lightTheme: string;
}

const themes: Theme = {
    darkTheme: 'dark-theme',
    lightTheme: 'light-theme'
};

const themeToggle = document.getElementById('theme-toggle') as HTMLElement | null;
const themeIcon = document.getElementById('theme-icon') as HTMLElement | null;
const body = document.body;

function updateIcon(theme: string): void {
    if (!themeIcon) return;
    themeIcon.classList.remove('fas', 'fa-moon', 'fa-sun');
    themeIcon.classList.add('fas', theme === themes.darkTheme ? 'fa-sun' : 'fa-moon');
}

function applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    body.classList.remove(themes.darkTheme, themes.lightTheme);
    if (savedTheme === themes.darkTheme) {
        body.classList.add(themes.darkTheme);
    } else {
        body.classList.add(themes.lightTheme);
        localStorage.setItem('theme', themes.lightTheme);
    }
    updateIcon(savedTheme || themes.lightTheme);
}

function toggleTheme(): void {
    if (body.classList.contains(themes.darkTheme)) {
        body.classList.remove(themes.darkTheme);
        body.classList.add(themes.lightTheme);
        localStorage.setItem('theme', themes.lightTheme);
    } else {
        body.classList.remove(themes.lightTheme);
        body.classList.add(themes.darkTheme);
        localStorage.setItem('theme', themes.darkTheme);
    }
    updateIcon(body.classList.contains(themes.darkTheme) ? themes.darkTheme : themes.lightTheme);
}

applySavedTheme();

themeToggle?.addEventListener('click', toggleTheme);

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});