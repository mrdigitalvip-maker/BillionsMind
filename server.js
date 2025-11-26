import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chatHandler from "./api/chat.js";
import saveMessageHandler from "./api/saveMessage.js";
import createPlanHandler from "./api/api/createPlan.js";
import getHistoryHandler from "./api/api/getHistory.js";
import getPlanHandler from "./api/api/getPlan.js";
import imageHandler from "./api/api/image.js";
import loginHandler from "./api/api/login.js";
import signupHandler from "./api/api/signup.js";
import updateConfigHandler from "./api/api/updateConfig.js";
import checkoutHandler from "./api/api/checkout.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const routes = {
  "/api/chat": chatHandler,
  "/api/saveMessage": saveMessageHandler,
  "/api/createPlan": createPlanHandler,
  "/api/getHistory": getHistoryHandler,
  "/api/getPlan": getPlanHandler,
  "/api/image": imageHandler,
  "/api/login": loginHandler,
  "/api/signup": signupHandler,
  "/api/updateConfig": updateConfigHandler,
  "/api/checkout": checkoutHandler,
};

function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.headersSent) {
      res.writeHead(res.statusCode || 200, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify(payload));
  };
  res.send = (payload) => {
    if (typeof payload === "object") {
      return res.json(payload);
    }
    if (!res.headersSent) {
      res.writeHead(res.statusCode || 200, { "Content-Type": "text/plain" });
    }
    res.end(payload);
  };
}

function serveStatic(res, filePath) {
  const resolvedPath = path.join(__dirname, filePath);
  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Arquivo não encontrado" }));
      return;
    }
    const contentType = filePath.endsWith(".html") ? "text/html" : "text/plain";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function attachQuery(req, parsedUrl) {
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());
}

async function attachBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        req.body = {};
        return resolve();
      }
      try {
        req.body = JSON.parse(data);
        resolve();
      } catch (err) {
        reject(new Error("Falha ao fazer parse do corpo JSON."));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  decorateResponse(res);

  if (routes[pathname]) {
    try {
      attachQuery(req, parsedUrl);
      if (req.method !== "GET") {
        await attachBody(req);
      }
      await routes[pathname](req, res);
    } catch (error) {
      console.error("Erro inesperado na rota", pathname, error);
      res.status(500).json({ error: error.message || "Erro interno" });
    }
    return;
  }

  if (pathname === "/" || pathname === "/index.html") {
    return serveStatic(res, "index.html");
  }

  res.status(404).json({ error: "Rota não encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
