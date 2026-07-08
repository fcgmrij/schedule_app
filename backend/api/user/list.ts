import { createClient } from "../../src/db/client.js";

export async function GET() {
  const client = createClient();

  try {
    await client.connect();

    const result = await client.query("SELECT * FROM users ORDER BY id");

    return Response.json(result.rows);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        message: "user list failed",
        error: String(error),
      },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}