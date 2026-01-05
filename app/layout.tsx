import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HELOC Lead Pilot",
  description: "Email-first HELOC lead intake for quick daily batching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17850908521"
          strategy="afterInteractive"
        />
        <Script id="google-ads-base" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-17850908521');`}
        </Script>
      </head>
      <body className={`${plusJakarta.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
