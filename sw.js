self.importScripts("/assets/themes.js");

const prefetch = Object.values(themes).map(({ src }) => src);
const cacheName = "theme";

self.addEventListener("activate", function (event) {
  return event.waitUntil(
    self.clients.claim(),
    caches.open(cacheName).then((cache) => cache.addAll(prefetch))
  );
});

let theme = themes.light;

self.addEventListener("message", ({ data }) => {
  if (data.theme) {
    theme = themes[data.theme];
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (
    theme &&
    url.origin == location.origin &&
    url.pathname == fallbackThemeSrc
  ) {
    event.respondWith(
      caches.match(theme.src).then(
        (response) =>
          new Response(response.body, {
            status: 200,
            statusText: "OK",
            headers: {
              "cache-control": "no-cache, no-store, must-revalidate",
            },
          })
      )
    );
  }
});
