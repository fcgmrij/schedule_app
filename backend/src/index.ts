import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "backend root ok" });
});

app.get("/api/health", (c) => {
  return c.json({ message: "backend api ok" });
});

export default app;