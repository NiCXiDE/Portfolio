/** Shared theme key + FOUC-prevention script (server-safe; no "use client"). */

export const THEME_STORAGE_KEY = "portfolio-theme";

export function themeInitScript() {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var p=s==="light"||s==="dark"||s==="system"?s:"system";var r=p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.setAttribute("data-theme",r);document.documentElement.style.colorScheme=r;}catch(e){}})();`;
}
