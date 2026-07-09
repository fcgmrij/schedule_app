import { Hono } from "hono";
import { createClient } from "./db/client.js";

const app = new Hono();
 
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://schedule-app-frontend-alpha.vercel.app",
  "https://schedule-app-freiji.vercel.app",
  "*",
   
];

app.use("/api/*", async (c, next) => {
  const origin = c.req.header("Origin");

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
  } else {
    c.header("Access-Control-Allow-Origin", "*");
  }

  c.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
});

app.options("/api/*", (c) => {
  return new Response(null, { status: 204 });
});

app.get("/", (c) => {
  return c.json({ message: "backend root ok" });
});

app.get("/api/health", (c) => {
  return c.json({ message: "backend api ok" });
});

app.get("/api/user/list", async (c) => {
  const client = createClient();

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM users ORDER BY id");
    return c.json(result.rows);
  } catch (error) {
    console.error(error);
    return c.json([]);
  } finally {
    await client.end();
  }
});

app.post("/api/user/create", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = body.user_name || body.name || "guest";
  const email = body.user_email || `${name}@example.com`;

  return c.json({ ok: true, id: Date.now(), name, email });
});

app.delete("/api/user/delete", (c) => {
  return c.json({ ok: true });
});

app.get("/api/schedule/get/:userId", (c) => {
  return c.json([]);
});

app.post("/api/schedule/create", (c) => {
  return c.json({ ok: true });
});

app.delete("/api/schedule/delete", (c) => {
  return c.json({ ok: true });
});

app.get("/api/user/test", (c) => {
  return c.json({ message: "user test ok" });
});

export default app;

