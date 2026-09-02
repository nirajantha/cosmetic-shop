import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Image storage isn't configured yet. Set CLOUDINARY_* environment variables." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP and AVIF images are supported." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "aurelle",
      resource_type: "image",
    });
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch {
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 502 });
  }
}
