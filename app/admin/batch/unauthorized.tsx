export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1b1a] px-6 text-[#f8f4ee]">
      <div className="rounded-3xl border border-[#f8f4ee]/15 bg-[#25221f] px-8 py-10 text-center shadow-[0_18px_60px_-30px_rgba(0,0,0,0.6)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d7d0c5]">
          401
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Unauthorized</h1>
      </div>
    </div>
  );
}
