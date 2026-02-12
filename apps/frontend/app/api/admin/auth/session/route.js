import { NextResponse } from "next/server";
import { readAdminSessionFromRequest } from "../../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await readAdminSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        email: session.email,
        role: session.role
      }
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal membaca session admin." }, { status: 500 });
  }
}
