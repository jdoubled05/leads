import { supabaseServer } from "@/lib/supabaseServer";
import { NextRequest } from "next/server";

const csvEscape = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const getAdminToken = () => process.env.ADMIN_EXPORT_TOKEN ?? "";

export async function GET(request: NextRequest) {
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

  const { data, error } = await supabaseServer
    .from("leads")
    .select("*")
    .eq("status", "new")
    .order("lead_score", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return new Response("Failed to fetch leads", { status: 500 });
  }

  const batchDate = new Date().toISOString().slice(0, 10);

  const headers = [
    "Batch Date",
    "Lead Score",
    "Tier",
    "Email",
    "ZIP",
    "Estimated Equity",
    "Estimated Home Value",
    "Mortgage Balance",
    "Use Case",
    "Timeline",
    "Credit Band",
    "Primary Residence",
    "Property Type",
    "Submitted At",
    "Lead ID",
  ];

  const rows = (data ?? []).map((lead) =>
    [
      batchDate,
      lead.lead_score,
      lead.lead_tier,
      lead.email,
      lead.zip,
      lead.est_equity,
      lead.est_home_value,
      lead.mortgage_balance,
      lead.use_case,
      lead.timeline,
      lead.credit_band,
      lead.primary_residence ? "yes" : "no",
      lead.property_type,
      lead.created_at,
      lead.id,
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=heloc-leads-${batchDate}.csv`,
    },
  });
}
