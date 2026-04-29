import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Property Finder",
  description: "Natural-language property search powered by OpenAI and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
