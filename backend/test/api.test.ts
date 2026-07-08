import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/index.ts";

test("schedule route responds with JSON", async () => {
  const res = await app.request("http://localhost/api/schedule/get/1");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
});

test("health route exposes CORS headers", async () => {
  const res = await app.request("http://localhost/api/health", {
    headers: { origin: "https://schedule-app-frontend-alpha.vercel.app" },
  });

  assert.equal(res.status, 200);
  assert.match(res.headers.get("access-control-allow-origin") || "", /schedule-app-frontend-alpha|\*/);
});
