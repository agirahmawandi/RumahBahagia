import type { Metadata, Viewport } from "next";
import { Montserrat, Karla } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FFFBEF",
};

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${montserrat.variable} ${karla.variable}`}
    >
      <body className="min-h-screen bg-cream-50 text-ink antialiased selection:bg-teal/30 selection:text-ink font-body">
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
