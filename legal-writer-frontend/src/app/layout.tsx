import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navigation/NavBar";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Writer",
  description: "AI-powered legal document writing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <NavBar />
          <main className="min-h-screen bg-gray-50">
            {children}
            <Toaster position="top-right" />
          </main>
        </Providers>
      </body>
    </html>
  );
}
