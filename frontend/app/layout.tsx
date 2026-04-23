import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "DataAgent X — AI Business Intelligence",
  description:
    "Upload your data → Train ML models → Get AI-powered business insights in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} h-full`}>
      <body className="min-h-full bg-[#060810] text-white font-sans">
        {children}
      </body>
    </html>
  );
}