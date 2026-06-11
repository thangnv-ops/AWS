"use strict";

const http = require("http");
const os = require("os");

const port = Number(process.env.PORT || 8080);
const startedAt = new Date();

function getStatus() {
  return {
    ok: true,
    message: "Hello from AWS Elastic Beanstalk",
    environment: "Thangnv-beanstalk-env",
    node: process.version,
    platform: os.platform(),
    hostname: os.hostname(),
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString()
  };
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body, null, 2);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html)
  });
  res.end(html);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHomePage(status) {
  const rows = [
    ["Environment", status.environment],
    ["Node.js", status.node],
    ["Platform", status.platform],
    ["Hostname", status.hostname],
    ["Uptime", `${status.uptimeSeconds}s`],
    ["Started", status.startedAt]
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Thangnv Beanstalk</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7fb;
      --surface: #ffffff;
      --ink: #182033;
      --muted: #667085;
      --line: #d9e1ec;
      --brand: #1769e0;
      --brand-strong: #0d47a1;
      --accent: #17a673;
      --warning: #f59e0b;
      --shadow: 0 22px 70px rgba(24, 32, 51, 0.14);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at 14% 14%, rgba(23, 105, 224, 0.12), transparent 30%),
        linear-gradient(135deg, #f8fbff 0%, #eef3f9 52%, #f7faf8 100%);
    }

    .shell {
      width: min(1120px, calc(100% - 32px));
      min-height: 100vh;
      margin: 0 auto;
      padding: 28px 0;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 28px;
    }

    header,
    footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 800;
      font-size: 18px;
    }

    .mark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--accent));
      box-shadow: 0 12px 28px rgba(23, 105, 224, 0.24);
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      padding: 0 12px;
      border: 1px solid rgba(23, 166, 115, 0.28);
      border-radius: 999px;
      color: #067647;
      background: rgba(23, 166, 115, 0.1);
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 0 5px rgba(23, 166, 115, 0.16);
    }

    main {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
      align-items: center;
      gap: 36px;
    }

    .hero {
      padding: 24px 0;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
      color: var(--brand-strong);
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
    }

    h1 {
      max-width: 760px;
      margin: 0;
      font-size: clamp(42px, 8vw, 86px);
      line-height: 0.95;
      letter-spacing: 0;
    }

    .lead {
      max-width: 630px;
      margin: 24px 0 0;
      color: var(--muted);
      font-size: 19px;
      line-height: 1.65;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 32px;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border-radius: 8px;
      border: 1px solid var(--line);
      color: var(--ink);
      background: rgba(255, 255, 255, 0.78);
      text-decoration: none;
      font-weight: 800;
      box-shadow: 0 10px 30px rgba(24, 32, 51, 0.08);
    }

    .button.primary {
      color: #ffffff;
      border-color: var(--brand);
      background: var(--brand);
    }

    .panel {
      overflow: hidden;
      border: 1px solid rgba(217, 225, 236, 0.9);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .panel-head {
      padding: 22px;
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 251, 255, 0.82));
    }

    .panel-title {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--line);
    }

    .metric {
      min-height: 116px;
      padding: 22px;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .metric:nth-child(2n) {
      border-right: 0;
    }

    .metric:nth-last-child(-n + 2) {
      border-bottom: 0;
    }

    .label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .value {
      margin-top: 10px;
      overflow-wrap: anywhere;
      font-size: 20px;
      font-weight: 900;
    }

    .details {
      padding: 8px 22px 22px;
    }

    .row {
      display: grid;
      grid-template-columns: 116px minmax(0, 1fr);
      gap: 16px;
      padding: 14px 0;
      border-bottom: 1px solid rgba(217, 225, 236, 0.78);
    }

    .row:last-child {
      border-bottom: 0;
    }

    .row dt {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
      font-weight: 800;
    }

    .row dd {
      margin: 0;
      overflow-wrap: anywhere;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 14px;
      color: #24304a;
    }

    footer {
      color: var(--muted);
      font-size: 14px;
    }

    @media (max-width: 860px) {
      .shell {
        width: min(100% - 24px, 680px);
        padding: 18px 0;
        gap: 18px;
      }

      header,
      footer,
      main {
        align-items: stretch;
      }

      header,
      footer {
        flex-direction: column;
      }

      main {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .hero {
        padding: 8px 0;
      }

      .lead {
        font-size: 17px;
      }

      .metric-grid {
        grid-template-columns: 1fr;
      }

      .metric,
      .metric:nth-child(2n),
      .metric:nth-last-child(-n + 2) {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .metric:last-child {
        border-bottom: 0;
      }
    }

    @media (max-width: 520px) {
      h1 {
        font-size: 44px;
      }

      .actions,
      .button {
        width: 100%;
      }

      .row {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div class="brand">
        <div class="mark" aria-hidden="true">AWS</div>
        <span>Thangnv Beanstalk</span>
      </div>
      <div class="pill"><span class="dot" aria-hidden="true"></span> Live on Elastic Beanstalk</div>
    </header>

    <main>
      <section class="hero" aria-labelledby="page-title">
        <div class="eyebrow">Node.js 24 · Amazon Linux 2023</div>
        <h1 id="page-title">Deploy thanh cong tren AWS.</h1>
        <p class="lead">
          Day la giao dien mau cho environment Elastic Beanstalk cua ban.
          Trang nay duoc render truc tiep tu Node.js va cap nhat thong tin runtime theo instance dang chay.
        </p>
        <div class="actions">
          <a class="button primary" href="/health">View health JSON</a>
          <a class="button" href="https://aws.amazon.com/elasticbeanstalk/" rel="noreferrer">Elastic Beanstalk</a>
        </div>
      </section>

      <section class="panel" aria-label="Runtime status">
        <div class="panel-head">
          <p class="panel-title">Runtime status</p>
          <div class="pill"><span class="dot" aria-hidden="true"></span> Healthy</div>
        </div>
        <div class="metric-grid">
          <div class="metric">
            <div class="label">Environment</div>
            <div class="value">${escapeHtml(status.environment)}</div>
          </div>
          <div class="metric">
            <div class="label">Runtime</div>
            <div class="value">${escapeHtml(status.node)}</div>
          </div>
          <div class="metric">
            <div class="label">Uptime</div>
            <div class="value">${escapeHtml(status.uptimeSeconds)}s</div>
          </div>
          <div class="metric">
            <div class="label">Status</div>
            <div class="value">Online</div>
          </div>
        </div>
        <dl class="details">
          ${rows
            .map(
              ([label, value]) => `<div class="row">
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value)}</dd>
          </div>`
            )
            .join("")}
        </dl>
      </section>
    </main>

    <footer>
      <span>CodePipeline source: GitHub main</span>
      <span>Generated by Node.js on Elastic Beanstalk</span>
    </footer>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/") {
    sendHtml(res, 200, renderHomePage(getStatus()));
    return;
  }

  if (url.pathname === "/health") {
    sendJson(res, 200, getStatus());
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
