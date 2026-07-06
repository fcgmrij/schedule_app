import { Hono } from "hono";
import { createClient } from "../db/client";

const userRoutes = new Hono();

export default userRoutes;