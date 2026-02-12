import { NextResponse } from "next/server";
import { appendActivityLog, readContent, writeContent } from "../../../../lib/content-repository";
import { requireAdminSession } from "../../../../lib/admin-route-auth";
import { resolveAdminActor } from "../../../../lib/admin-auth";
import { buildChangeDiff } from "../../../../lib/diff-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const content = await readContent();
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal membaca konten." }, { status: 500 });
  }
}

export async function PUT(request) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const body = await request.json();
    const actor = resolveAdminActor(request, session);
    const beforeContent = await readContent();
    const content = await writeContent(body, { actor });

    await appendActivityLog({
      actor,
      action: "content.replace",
      target: { collection: "site_settings", id: "main" },
      changes: buildChangeDiff(beforeContent, content),
      metadata: { source: "api/admin/content" }
    });

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal menyimpan konten." }, { status: 500 });
  }
}
