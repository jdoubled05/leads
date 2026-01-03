import { NextRequest, NextResponse } from "next/server";

const isAuthorized = (token?: string) =>
  Boolean(token && token === process.env.ADMIN_EXPORT_TOKEN);

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;

  if (!isAuthorized(token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const origin = request.nextUrl.origin;
  const response = await fetch(`${origin}/api/admin/leads/mark-sent`, {
    method: "POST",
    headers: {
      "x-admin-token": process.env.ADMIN_EXPORT_TOKEN ?? "",
    },
  });

  if (!response.ok) {
    return new NextResponse("Failed to mark leads", { status: 500 });
  }

  const payload = (await response.json()) as { batch_date?: string };
  const redirectUrl = new URL("/admin/batch", origin);
  redirectUrl.searchParams.set("token", token ?? "");
  redirectUrl.searchParams.set("marked", "1");
  if (payload.batch_date) {
    redirectUrl.searchParams.set("batch_date", payload.batch_date);
  }

  return NextResponse.redirect(redirectUrl);
}
