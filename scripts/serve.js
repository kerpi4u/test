#!/usr/bin/env node
/**
 * Zero-dependency static server for local development.
 * Mirrors the GitHub Pages behaviour: directory index + custom 404.
 *
 *   npm run dev            # http://localhost:8000
 *   PORT=3000 npm run dev
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

function sendFile(res, filePath, status = 200) {
  const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const safePath = normalize(url).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden");
    return;
  }

  try {
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, "index.html");
    }
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      sendFile(res, filePath);
      return;
    }
  } catch {
    /* fall through to 404 */
  }

  const notFound = join(ROOT, "404.html");
  if (existsSync(notFound)) sendFile(res, notFound, 404);
  else send(res, 404, "Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`hello.world → http://localhost:${PORT}  (root: ${ROOT})`);
});
