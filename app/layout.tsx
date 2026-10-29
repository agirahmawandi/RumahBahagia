import type { Metadata } from "next";
import { Archivo_Narrow, Comfortaa, Maitree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const maitree = Maitree({
  variable: "--font-maitree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RumahBahagia — Catatan Keuangan Keluarga",
    template: "%s · RumahBahagia",
  },
  description:
    "Aplikasi pencatatan keuangan pribadi dan keluarga dengan prinsip pembukuan berpasangan (double-entry) yang sederhana, hangat, dan akurat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${archivoNarrow.variable} ${comfortaa.variable} ${maitree.variable}`}
    >
      <body className="min-h-screen bg-cream-50 text-ink antialiased selection:bg-teal/30 selection:text-ink">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "font-ui text-sm rounded-[12px] border border-line",
          }}
        />
      </body>
    </html>
  );
}
