import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HabitUp — Retos para tu mejor versión",
  description:
    "Crea retos individuales y en equipo, gestiona objetivos diarios y alcanza tu mejor versión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased text-slate-900`}>{children}</body>
    </html>
  );
}
