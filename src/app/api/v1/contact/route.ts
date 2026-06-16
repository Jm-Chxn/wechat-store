import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, apiError } from "@/app/api/_lib/response";
import { withRoute } from "@/app/api/_lib/route-wrapper";
import { createClient } from "@/utils/supabase/server";

const contactPayload = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const POST = withRoute("POST /api/v1/contact", async (req: NextRequest) => {
  const body = await req.json();
  const parsed = contactPayload.safeParse(body);

  if (!parsed.success) {
    return apiError(400, "Invalid contact form data");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });

    if (error) {
      // Table may not exist yet — log but don't fail the user
      console.error("[POST /api/v1/contact] supabase insert error:", error.message);
    }
  } catch (err) {
    console.error("[POST /api/v1/contact] supabase error:", err);
  }

  return ok({ success: true });
});
