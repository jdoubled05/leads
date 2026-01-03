import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Equity Check – HELOC Calculator & Equity Estimate",
  description:
    "Estimate how much home equity you may be able to access through a HELOC. No impact to credit. Informational only.",
};

export default function HelocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
