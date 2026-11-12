async function request(path, payload) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json", "x-program": "bmw-fr-ev" }, body: JSON.stringify(payload) });
  const body = await response.json();
  if (!response.ok) { const error = new Error(body.error?.message || "Request failed"); error.code = body.error?.code || "internal_error"; error.status = response.status; throw error; }
  return body;
}

export const createQuote = payload => request("/v1/quotes", { ...payload, program: "bmw-fr-ev" });
export const issueContract = payload => request("/v1/contracts", payload);
