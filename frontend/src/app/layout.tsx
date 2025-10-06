import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FortressStacks - Command the Bitcoin balance sheet",
  description: "Institutional-grade command center for Bitcoin treasuries built on Stacks, unifying live payments, automated policies, and yield governance under a single secure roof.",
  icons: {
    icon: [
      { url: '/fortress-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/fortress-logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/fortress-logo.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/fortress-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/fortress-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
