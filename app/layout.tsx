import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";
import "@/styles/main.scss";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "refineAI — LLM Experimentation",
    template: "%s · refineAI",
  },
  description: "Find the best model and prompt configuration for every task.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AppShell>{children}</AppShell>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
