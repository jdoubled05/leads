import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f4ee] px-6 py-16 text-[#1c1b1a] md:px-12">
      <div className="mx-auto max-w-3xl space-y-6 rounded-[32px] border border-[#1c1b1a]/10 bg-white/80 p-8 shadow-[0_24px_80px_-50px_rgba(28,27,26,0.6)]">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-[#4a4742]">
          This page summarizes how Home Equity Check handles information you
          share through the estimator.
        </p>
        <p className="text-[#4a4742]">
          We collect only the details needed to provide an informational equity
          estimate and to send follow-up information by email. We do not sell or
          share your information for marketing by third parties.
        </p>
        <Link className="text-sm font-semibold underline" href="/heloc">
          Back to lead form
        </Link>
      </div>
    </div>
  );
}
