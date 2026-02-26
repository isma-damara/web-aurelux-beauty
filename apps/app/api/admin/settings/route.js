import { NextResponse } from "next/server";
import { appendActivityLog, readSettings, updateSettings } from "../../../../lib/content-repository";
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
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal membaca settings." }, { status: 500 });
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
    const beforeSettings = await readSettings();
    const saved = await updateSettings(body, { actor });
    const afterSettings = {
      hero: saved.hero,
      about: saved.about,
      contact: saved.contact,
      socials: saved.socials,
      brand: saved.brand,
      footer: saved.footer
    };

    await appendActivityLog({
      actor,
      action: "settings.update",
      target: { collection: "site_settings", id: "main" },
      changes: buildChangeDiff(beforeSettings, afterSettings)
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal menyimpan settings." }, { status: 500 });
  }
}
