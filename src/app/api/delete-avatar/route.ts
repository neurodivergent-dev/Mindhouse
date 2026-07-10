import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser, UNAUTHORIZED } from "@/lib/supabase/server";

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are not configured");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(UNAUTHORIZED, { status: 401 });
    }

    // A user may only delete their own avatar slot; the public id is
    // derived from the verified user id, never from the request body.
    const candidates = [
      `mindhouse-avatars/${user.id}`,
      // Legacy avatars uploaded before public ids were pinned to user ids
      // were stored under a random id the client sent back; those can no
      // longer be deleted through this endpoint.
    ];

    let deleted = false;
    let successfulFormat = "";

    for (const candidate of candidates) {
      try {
        const result = await cloudinary.uploader.destroy(candidate, {
          resource_type: "image",
          type: "upload",
        });

        if (result.result === "ok" || result.result === "deleted") {
          deleted = true;
          successfulFormat = candidate;
          break;
        }
      } catch {
        // Do nothing
      }
    }

    if (!deleted) {
      return NextResponse.json({ error: "Avatar not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedFormat: successfulFormat,
      message: "Avatar deleted successfully",
    });
  } catch {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
