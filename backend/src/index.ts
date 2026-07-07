import userRoutes from "./routes/user";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { createClient } from "./db/client";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "backend root ok" });
});

app.get("/api/health", (c) => {
  return c.json({ message: "backend api ok" });
});


app.use("*", cors());

app.get("/", (c) => {
  return c.json({ message: "hello world" });
});
app.get("/db-test", async (c) => {
  const client = createClient();
  try {
    await client.connect();

    return c.json({
      message: "PostgreSQL connected!",
    });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        message: "PostgreSQL connection failed",
      },
      500
    );
  } finally {
    await client.end();
  }
});

app.get("/api/user/get/:user_id", async (c) => {
  const userId = c.req.param("user_id");

  const client = createClient();
  await client.connect();

  const result = await client.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );

  await client.end();

  return c.json(result.rows[0]);
});

app.post("/api/user/create", async (c) => {
  const body = await c.req.json();

  const client = createClient();
  await client.connect();

  const result = await client.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    [body.user_name, body.user_email]
  );

  await client.end();

  return c.json({ user_id: result.rows[0].id });
});

app.delete("/api/user/delete", async (c) => {
  const userId = c.req.query("user_id");

  const client = createClient();
  await client.connect();

  await client.query(
    "DELETE FROM users WHERE id = $1",
    [userId]
  );

  await client.end();

  return c.json({ message: "user deleted" });
});

app.put("/api/user/update", async (c) => {
  const userId = c.req.query("user_id");
  const body = await c.req.json();

  const client = createClient();
  await client.connect();

  await client.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [body.user_name, body.user_email, userId]
  );

  await client.end();

  return c.json({ message: "user updated" });
});

app.post("/api/schedule/create", async (c) => {
  const body = await c.req.json();

  const client = createClient();
  await client.connect();
  const result = await client.query(
    "INSERT INTO schedules (name, date, start_time, end_time, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [
      body.schedule_name,
      body.schedule_date,
      body.start_time,
      body.end_time,
      body.user_id,
    ]
  );

  await client.end();

  return c.json({ schedule_id: result.rows[0].id });
});

app.get("/api/schedule/get/:user_id", async (c) => {
  const userId = c.req.param("user_id");

  const client = createClient();
  await client.connect();

  const result = await client.query(
    "SELECT * FROM schedules WHERE user_id = $1",
    [userId]
  );

  await client.end();

  return c.json(result.rows);
});

app.put("/api/schedule/update", async (c) => {
  const scheduleId = c.req.query("schedule_id");
  const body = await c.req.json();

  const client = createClient();
  await client.connect();

  await client.query(
    "UPDATE schedules SET name = $1, date = $2 WHERE id = $3",
    [body.schedule_name, body.schedule_date, scheduleId]
  );

  await client.end();

  return c.json({ message: "schedule updated" });
});

app.delete("/api/schedule/delete", async (c) => {
  const scheduleId = c.req.query("schedule_id");

  const client = createClient();
  await client.connect();

  await client.query(
    "DELETE FROM schedules WHERE id = $1",
    [scheduleId]
  );

  await client.end();

  return c.json({ message: "schedule deleted" });
});

app.get("/api/user/list", async (c) => {
  const client = createClient();
  await client.connect();

  const result = await client.query(
    "SELECT * FROM users ORDER BY id"
  );

  await client.end();

  return c.json(result.rows);
});

app.route("/api/user", userRoutes);

export default app;
