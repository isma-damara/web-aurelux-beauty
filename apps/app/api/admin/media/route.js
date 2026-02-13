import { NextResponse } from "next/server";
import { deleteManagedUpload, saveUploadedFile } from "../../../../lib/media-store";
import { appendActivityLog, registerMediaAsset, removeMediaAsset } from "../../../../lib/content-repository";
import { requireAdminSession } from "../../../../lib/admin-route-auth";
import { resolveAdminActor } from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "File upload tidak ditemukan." }, { status: 400 });
    }

    const actor = resolveAdminActor(request, session);
    const savedFile = await saveUploadedFile(file);

    await registerMediaAsset(
      {
        ...savedFile,
        usage: formData.get("usage") || "generic"
      },
      { actor }
    );

    await appendActivityLog({
      actor,
      action: "media.upload",
      target: { collection: "media_assets", id: savedFile.url },
      metadata: { type: savedFile.type, url: savedFile.url }
    });

    return NextResponse.json(savedFile, { status: 201 });
  } catch (error) {
    const status = /tidak didukung di Vercel/i.test(error?.message) ? 400 : 500;
    return NextResponse.json({ message: error.message || "Gagal upload media." }, { status });
  }
}

export async function DELETE(request) {
  const { session, unauthorizedResponse } = await requireAdminSession(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    const actor = resolveAdminActor(request, session);
    const body = await request.json();
    const deleted = await deleteManagedUpload(body?.url);

    if (deleted && body?.url) {
      await removeMediaAsset(body.url, { actor });
      await appendActivityLog({
        actor,
        action: "media.delete",
        target: { collection: "media_assets", id: body.url }
      });
    }

    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Gagal menghapus media." }, { status: 500 });
  }
}
