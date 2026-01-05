import Link from "next/link";
import Logo from "@/components/Logo";

export default function PublicHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 py-2">
      <Link href="/" aria-label="Home Equity Check home">
        <Logo size="md" />
      </Link>
      <nav className="flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#5d5a54]">
        <Link className="transition hover:text-[#1c1b1a]" href="/privacy">
          Privacy
        </Link>
        <Link className="transition hover:text-[#1c1b1a]" href="/terms">
          Terms
        </Link>
      </nav>
    </header>
  );
}
