#!/usr/bin/env node

import { createServer } from "node:http";
import { appendFileSync } from "node:fs";

const PORT = 8787;
const LOG_PATH = new URL("./mock-webhook-log.ndjson", import.meta.url);

const server = createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "text/plain" });
    res.end("Only POST is supported");
    return;
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const payload = JSON.parse(body);
      const record = {
        receivedAt: new Date().toISOString(),
        payload
      };

      appendFileSync(LOG_PATH, `${JSON.stringify(record)}\n`);

      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, received: payload.action }, null, 2));
    } catch (error) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: error.message }, null, 2));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Mock webhook listening on http://localhost:${PORT}`);
  console.log(`Writing requests to ${LOG_PATH.pathname}`);
});
