import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createQuote, issueContract } from "./src/api/mock-api.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4000);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

function sendJson(response, status, body) { response.writeHead(status, { "content-type": "application/json; charset=utf-8" }); response.end(JSON.stringify(body)); return true; }
function errorBody(code, message, requestId) { return { error: { code, message, request_id: requestId } }; }
function requestId() { return `req_${Math.random().toString(36).slice(2, 10)}`; }
async function readJson(request) { let raw = ""; for await (const chunk of request) raw += chunk; return JSON.parse(raw || "{}"); }

async function handleApi(request, response) {
  const id = requestId();
  if (request.method !== "POST" || !["/v1/quotes", "/v1/contracts"].includes(request.url)) return false;
  if (request.headers["x-program"] !== "bmw-fr-ev") return sendJson(response, 400, errorBody("invalid_request", "The x-program header is required", id));
  try {
    const payload = await readJson(request);
    if (request.url === "/v1/quotes") {
      if (payload.program !== "bmw-fr-ev" || !payload.vehicle || !payload.driver) return sendJson(response, 400, errorBody("invalid_request", "Required quote fields are missing", id));
      const result = await createQuote(payload); return sendJson(response, 201, result);
    }
    if (!payload.quote_id || !payload.package_id || !payload.frequency || !payload.holder || !payload.consents) return sendJson(response, 400, errorBody("invalid_request", "Required contract fields are missing", id));
    const result = await issueContract(payload); return sendJson(response, 201, result);
  } catch (error) {
    const map = { SyntaxError: [400, "The request body is not valid JSON"], invalid_request: [400, "The request is invalid"], driver_ineligible: [422, "The driver is not eligible"], consent_required: [422, "All consents are required"], quote_expired: [409, "The quote has expired"], quote_not_found: [404, "The quote was not found"] };
    const errorKey = error.code || error.name;
    const [status, message] = map[errorKey] || [500, "Internal error"];
    return sendJson(response, status, errorBody(error.code || "internal_error", message, id));
  }
}

async function serveStatic(request, response) {
  const requested = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root)) return sendJson(response, 404, errorBody("not_found", "Not found", requestId()));
  try { const content = await readFile(filePath); response.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream" }); response.end(content); }
  catch { sendJson(response, 404, errorBody("not_found", "Not found", requestId())); }
}

createServer(async (request, response) => { if (await handleApi(request, response)) return; await serveStatic(request, response); }).listen(port, "127.0.0.1", () => console.log(`Ardenne running at http://127.0.0.1:${port}`));
