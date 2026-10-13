import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { ENABLED_LANGS, SITE_URL, dirOf, isEnabledLang } from "@/lib/config";
import "../globals.css";

export function generateStaticParams() {
  return ENABLED_LANGS.map((lang) => ({ lang }));
}

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isEnabledLang(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
