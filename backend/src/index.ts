import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "./db/client.js";


const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "backend root ok" });
});

app.get("/api/health", (c) => {
  return c.json({ message: "backend api ok" });
});

app.get("/user/list", async (c) => {
  const client = createClient();
  try {
    await client.connect();
    const result = await client.query("SELECT * FROM users ORDER BY id");
    return c.json(result.rows);
  } catch (error) {
    console.error(error);
    return c.json({
      message: "user list failed",
      error: String(error),
    }, 500);
  } finally {
    await client.end();
  }
});

export default app;