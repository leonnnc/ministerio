import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FirestoreProvider from "@/components/FirestoreProvider";

export const metadata: Metadata = {
  title: "Ministerio de Niños",
  description: "Sistema de gestión del Ministerio de Niños",
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-700 focus:rounded focus:shadow"
        >
          Ir al contenido principal
        </a>
        <Navbar />
        <FirestoreProvider>
          <main id="main-content" className="flex-1">{children}</main>
        </FirestoreProvider>
        <Footer />
      </body>
    </html>
  );
}
