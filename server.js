// Entry point for cPanel's "Setup Node.js App" (Passenger). Passenger requires a
// JS file it can `require()` directly — it cannot run npm scripts like `next start`.
// This is the standard custom-server pattern from the Next.js docs, kept minimal:
// it only starts an HTTP server and hands every request to Next.js.
//
// Not used for `npm run dev` / `npm run build` && `npm run start` — those still use
// Next.js's own server. Point cPanel's "Application startup file" at this file.
const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, () => {
      console.log(`> Ready on port ${port} (${dev ? "development" : "production"})`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
