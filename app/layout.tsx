import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  icons: { icon: "/logo/kcw-crest.png", apple: "/logo/kcw-crest.png" },
  metadataBase: new URL("https://kcw.hu"),
  title: "Keep Calm & Roll | Keep Calm and Wipe",
  description:
    "Ma mivel menjek? A Keep Calm and Wipe guild WoW Forever kasztsorsolója.",
  alternates: { canonical: "/roll" },
  openGraph: {
    title: "Keep Calm & Roll",
    description: "A Keep Calm and Wipe guild WoW Forever kasztsorsolója.",
    url: "/roll",
    siteName: "Keep Calm and Wipe",
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
