import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana TX Explainer — Debug Failed Transactions",
  description:
    "Paste a Solana transaction signature to get a human-readable diagnosis and suggested fix.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sol-dark antialiased">{children}</body>
    </html>
  );
}
