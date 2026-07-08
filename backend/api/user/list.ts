import app from "../../src/index.js";

export async function GET(request: Request) {
  return app.fetch(request);
}

export async function OPTIONS(request: Request) {
  return app.fetch(request);
}