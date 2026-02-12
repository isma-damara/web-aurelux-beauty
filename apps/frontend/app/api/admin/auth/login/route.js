import { NextResponse } from "next/server";
import {
  buildAdminSessionCookie,
  createAdminSessionToken
} from "../../../../../lib/admin-auth";
import { verifyAdminCredentialsFromMongo } from "../../../../../lib/mongo-admin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email;
    const password = body?.password;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
    }

    const adminUser = await verifyAdminCredentialsFromMongo(email, password);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ message: "Email atau password admin salah." }, { status: 401 });
    }

    const token = await createAdminSessionToken({
      email: adminUser.email,
      role: adminUser.role
    });

    const response = NextResponse.json({
      user: {
        email: adminUser.email,
        role: adminUser.role
      }
    });

    response.cookies.set(buildAdminSessionCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal login admin." }, { status: 500 });
  }
}
