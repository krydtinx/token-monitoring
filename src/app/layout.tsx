import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Usage Dashboard",
  description: "Track OpenRouter API token usage and costs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
