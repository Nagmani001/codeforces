import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@repo/ui/globals.css"
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "../components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codeforces",
  description: "Competitive programming platform for solving problems, practicing algorithms, and competing in contests.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/codeforces.jpeg", type: "image/jpeg" },
    ],
    apple: "/codeforces.jpeg",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <Toaster position="bottom-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
