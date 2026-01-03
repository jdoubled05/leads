import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest } from "next/server";

const getAdminToken = () => process.env.ADMIN_EXPORT_TOKEN ?? "";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (!token || token !== getAdminToken()) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new Response("Server not configured", { status: 500 });
  }

  const batchDate = new Date().toISOString().slice(0, 10);

  const { error } = await supabaseServer
    .from("leads")
    .update({ status: "sent", batch_date: batchDate })
    .eq("status", "new");

  if (error) {
    return new Response("Failed to update leads", { status: 500 });
  }

  return Response.json({ ok: true, batch_date: batchDate });
}
