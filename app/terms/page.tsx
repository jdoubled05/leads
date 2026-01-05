import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f4ee] px-6 py-10 text-[#1c1b1a] md:px-12">
      <div className="mx-auto max-w-3xl">
        <PublicHeader />
      </div>
      <div className="mx-auto mt-6 max-w-3xl space-y-6 rounded-[32px] border border-[#1c1b1a]/10 bg-white/80 p-8 shadow-[0_24px_80px_-50px_rgba(28,27,26,0.6)]">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="text-[#4a4742]">
          Home Equity Check provides an informational estimate based on the
          details you submit.
        </p>
        <p className="text-[#4a4742]">
          We are not a lender. Estimates are informational only and do not
          guarantee eligibility, rates, or available credit.
        </p>
        <Link className="text-sm font-semibold underline" href="/heloc">
          Back to lead form
        </Link>
      </div>
    </div>
  );
}
