import { Hono } from "hono";
import { createClient } from "../db/client.js";

const userRoutes = new Hono();

export default userRoutes;