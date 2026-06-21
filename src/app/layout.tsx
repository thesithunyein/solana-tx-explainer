import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solana TX Explainer — Debug Failed Transactions",
  description:
    "Paste a Solana transaction signature to get an instant human-readable diagnosis, root cause analysis, and suggested fix.",
  openGraph: {
    title: "Solana TX Explainer — Debug Failed Transactions",
    description:
      "Paste a Solana transaction signature to get an instant human-readable diagnosis, root cause analysis, and suggested fix.",
    type: "website",
    siteName: "Solana TX Explainer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solana TX Explainer",
    description: "Debug failed Solana transactions with AI-powered diagnosis.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-sol-darker antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
