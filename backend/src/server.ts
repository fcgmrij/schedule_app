import { serve } from "@hono/node-server";
import app from "./index";

serve({
  fetch: app.fetch,
  port: 8080,
});

console.log("Hono server is running on http://localhost:8080");