import { verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  console.log("LOGIN ATTEMPT - Username:", username, process.env.AUTH_USERNAME);
  console.log("LOGIN ATTEMPT - Loaded Hash:", process.env.AUTH_PASSWORD_HASH);
  
  const valid = await verifyCredentials(username, password);
  console.log("LOGIN ATTEMPT - Is valid:", valid);

  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(username);

  return Response.json({ success: true });
}
