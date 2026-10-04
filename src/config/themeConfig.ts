export const DEFAULT_THEME_ID = 'industrial-blue';
export function getActiveThemeId(): string { return localStorage.getItem('uc_theme') || DEFAULT_THEME_ID; }
export function applyThemeToDOM(themeId: string = DEFAULT_THEME_ID): void { document.documentElement.dataset.theme = themeId; localStorage.setItem('uc_theme', themeId); }
