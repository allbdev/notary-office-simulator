import "@fontsource/public-sans/latin-400.css";
import "@fontsource/public-sans/latin-600.css";
import "@fontsource/public-sans/latin-700.css";
import "@fontsource/public-sans/latin-800.css";
import "@fontsource/public-sans/latin-ext-400.css";
import "@fontsource/public-sans/latin-ext-700.css";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-700.css";
import "@fontsource/caveat/latin-500.css";
import "@fontsource/caveat/latin-700.css";
import "@fontsource/vt323/latin-400.css";
import "./styles.css";
import { App } from "./ui/app";

const params = new URLSearchParams(location.search);
const test = params.get("test") === "1";

const app = new App({
  root: document.getElementById("app")!,
  seed: params.get("seed"),
  date: params.get("date"),
  speed: test ? Number(params.get("speed") ?? 1) || 1 : 1,
  url: location.origin + location.pathname,
});
app.start();

addEventListener("pagehide", () => app.saveNow());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") app.saveNow();
});

if (test) (window as unknown as { __cartorio: App }).__cartorio = app;
