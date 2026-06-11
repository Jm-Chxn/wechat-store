import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { withRoute } from "@/app/api/_lib/route-wrapper";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "product-images";

export const POST = withRoute(
  "POST /api/v1/admin/products/upload",
  async (request: NextRequest) => {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiError(400, "Expected multipart/form-data body");
    }

    const file = formData.get("file");
    if (!(file instanceof File)) return apiError(400, "Missing 'file' field");

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(400, `File type not allowed. Use: ${ALLOWED_TYPES.join(", ")}`);
    }
    if (file.size > MAX_BYTES) {
      return apiError(400, "File exceeds 5 MB limit");
    }

    const ext = file.type.split("/")[1]; // jpeg | png | webp
    const filename = `${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[upload] storage upload failed:", error);
      return apiError(500, "Internal server error");
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return ok({ url: urlData.publicUrl }, 201);
  },
);
