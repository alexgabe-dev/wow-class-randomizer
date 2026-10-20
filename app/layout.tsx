import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/logo/kcw-crest.png", apple: "/logo/kcw-crest.png" },
  metadataBase: new URL("https://kcw.hu"),
  title: "Keep Calm & Roll | WoW Forever",
  description: "Ma mivel menjek? WoW Forever kasztsorsoló.",
  alternates: { canonical: "/roll" },
  openGraph: {
    title: "Keep Calm & Roll",
    description: "WoW Forever kasztsorsoló.",
    url: "/roll",
    siteName: "Keep Calm & Roll",
    locale: "hu_HU",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
