import { NextResponse } from "next/server";
import { readAdminSessionFromRequest } from "./admin-auth";

export async function requireAdminSession(request) {
  const session = await readAdminSessionFromRequest(request);

  if (!session) {
    return {
      session: null,
      unauthorizedResponse: NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    };
  }

  return {
    session,
    unauthorizedResponse: null
  };
}
