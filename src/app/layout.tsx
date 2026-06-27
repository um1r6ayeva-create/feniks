import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    title: site.title,
    description: site.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = await getContent();

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{
        "--bg": theme.background,
        "--fg": theme.foreground,
        "--accent": theme.accent,
        "--accent-light": theme.accentLight,
      } as React.CSSProperties}
    >
      <body
        style={{
          background: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
