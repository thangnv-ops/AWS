"use strict";

const http = require("http");
const os = require("os");

const port = Number(process.env.PORT || 8080);
const startedAt = new Date();

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body, null, 2);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/" || url.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      message: "Hello from AWS Elastic Beanstalk",
      environment: "Thangnv-beanstalk-env",
      node: process.version,
      platform: os.platform(),
      hostname: os.hostname(),
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: startedAt.toISOString()
    });
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "Not found"
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
