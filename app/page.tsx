import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f4ee] text-[#1c1b1a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(235,207,166,0.7),_transparent_55%),radial-gradient(circle_at_80%_20%,_rgba(197,214,241,0.65),_transparent_45%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-start justify-center px-6 py-20 md:px-12">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1c1b1a]/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
          Home Equity Check
        </span>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight md:text-6xl">
          An informational home equity estimate in a few minutes.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#3d3a35]">
          Understand potential HELOC ranges without affecting your credit. This
          tool provides estimates only and does not offer loans.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/heloc"
            className="inline-flex items-center justify-center rounded-full bg-[#1c1b1a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f8f4ee] transition hover:bg-[#2e2a24]"
          >
            Start Equity Estimate
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center justify-center rounded-full border border-[#1c1b1a]/20 bg-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1c1b1a] transition hover:border-[#1c1b1a]/40"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
