import Link from "next/link";

type SearchParams = {
  token?: string;
  marked?: string;
  batch_date?: string;
};

const isAuthorized = (token?: string) =>
  Boolean(token && token === process.env.ADMIN_EXPORT_TOKEN);

export default async function BatchAdminPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const token = resolved?.token;

  if (!isAuthorized(token)) {
    return (
      <div className="min-h-screen bg-[#1c1b1a] text-[#f8f4ee]">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 md:px-12">
          <div className="rounded-[32px] border border-[#f8f4ee]/10 bg-[#25221f] px-8 py-10 text-center shadow-[0_24px_80px_-50px_rgba(0,0,0,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
              401
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Unauthorized</h1>
            <p className="mt-3 text-sm text-[#d7d0c5]">
              Missing or invalid token.
            </p>
            <p className="mt-2 text-xs text-[#d7d0c5]">
              Use /admin/batch?token=YOUR_ADMIN_EXPORT_TOKEN
            </p>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const marked = resolved?.marked === "1";
  const batchDate = resolved?.batch_date;

  return (
    <div className="min-h-screen bg-[#1c1b1a] text-[#f8f4ee]">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16 md:px-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
            Admin Console
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Daily Lead Batch
          </h1>
          <p className="text-sm text-[#d7d0c5]">{today}</p>
        </header>

        <section className="mt-10 grid gap-6 rounded-[32px] border border-[#f8f4ee]/10 bg-[#25221f] p-8 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.7)]">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href={`/admin/batch/export?token=${encodeURIComponent(
                token ?? ""
              )}`}
              className="flex flex-col justify-between rounded-3xl border border-[#f8f4ee]/15 bg-[#1c1b1a] px-6 py-6 transition hover:border-[#f8f4ee]/30"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
                Action A
              </span>
              <span className="mt-4 text-lg font-semibold">
                Download CSV of NEW leads
              </span>
              <span className="mt-3 text-sm text-[#d7d0c5]">
                Pulls the current queue for today&apos;s batch.
              </span>
            </Link>

            <form
              method="post"
              action={`/admin/batch/mark-sent?token=${encodeURIComponent(
                token ?? ""
              )}`}
              className="flex flex-col justify-between rounded-3xl border border-[#f8f4ee]/15 bg-[#1c1b1a] px-6 py-6"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
                Action B
              </span>
              <span className="mt-4 text-lg font-semibold">
                Mark NEW leads as SENT
              </span>
              <span className="mt-3 text-sm text-[#d7d0c5]">
                Locks the batch after it&apos;s been imported.
              </span>
              <button
                type="submit"
                className="mt-6 rounded-full bg-[#f8f4ee] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1c1b1a] transition hover:bg-white"
              >
                Mark as Sent
              </button>
            </form>
          </div>

          {marked && batchDate && (
            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
              Batch marked as sent for {batchDate}.
            </div>
          )}

          <div className="rounded-3xl border border-[#f8f4ee]/10 bg-[#1c1b1a] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
              Checklist
            </p>
            <ol className="mt-4 space-y-2 text-sm text-[#f8f4ee]/90">
              <li>1) Download CSV</li>
              <li>2) Append into Google Sheet (do not overwrite)</li>
              <li>3) Click &quot;Mark as Sent&quot;</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
