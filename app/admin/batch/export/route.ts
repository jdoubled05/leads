import { NextRequest, NextResponse } from "next/server";

const isAuthorized = (token?: string) =>
  Boolean(token && token === process.env.ADMIN_EXPORT_TOKEN);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;

  if (!isAuthorized(token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const origin = request.nextUrl.origin;
  const response = await fetch(`${origin}/api/admin/leads/export`, {
    headers: {
      "x-admin-token": process.env.ADMIN_EXPORT_TOKEN ?? "",
    },
  });

  if (!response.ok) {
    return new NextResponse("Failed to export leads", { status: 500 });
  }

  const csv = await response.text();
  const filename =
    response.headers.get("Content-Disposition") ??
    "attachment; filename=heloc-leads.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": filename,
    },
  });
}
