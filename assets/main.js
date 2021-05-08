const lsKey = "prefers-color-scheme";
const getThemeName = () => localStorage.getItem(lsKey) || "light";
const setThemeName = (theme) => localStorage.setItem(lsKey, theme);

const setupThemeLink = (themeName) => {
  const theme = themes[themeName];
  const selector = [
    ...Object.values(themes).map(({ src }) => src),
    fallbackThemeSrc,
  ]
    .map((src) => `link[href="${src}"]`)
    .join(", ");

  const el = document.querySelector(selector);

  if (el && el.href !== theme.src) {
    el.href = theme.src;
  }
};

window.addEventListener("load", () => {
  const selector = "select#theme";
  const el = document.querySelector(selector);
  const currentTheme = getThemeName();

  for (const [name, { label }] of Object.entries(themes)) {
    const option = document.createElement("option");

    option.innerText = label;
    option.value = name;
    option.selected = name === currentTheme;

    el.appendChild(option);
  }

  el.addEventListener("change", ({ target: { value: themeName } }) => {
    setThemeName(themeName);
    setupThemeLink(themeName);
    updateWorkerTheme(themeName);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) =>
        registration.active.postMessage({ theme })
      );
    }
  });
});

if ("serviceWorker" in navigator) {
  const theme = getThemeName();

  setupThemeLink(theme);

  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => registration.ready.postMessage({ theme }));
}
