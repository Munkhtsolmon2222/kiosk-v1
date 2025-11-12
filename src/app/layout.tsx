import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../../providers/queryProvider";
import { ProductProvider } from "../../providers/productContext";
import { CategoryProvider } from "../../providers/CategoriesContext";
import { CartProvider } from "../../providers/cartContext";
import { IsOpenProvider } from "../../providers/isOpenContext";
import { ScannedProductProvider } from "../../providers/scannedProductContext";
import HideNavCartWrapper from "./_components/hideNavCartWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Одоо та 4 төрлийн жингийг ачааллаж байна
});

// ✅ Keep metadata only for SEO stuff
export const metadata: Metadata = {
  title: " Erchuudiin delguur  ",
  description: "call me baby 89005845",
};

// ✅ Move viewport into its own export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.75,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
      >
        <QueryProvider>
          <ProductProvider>
            <CategoryProvider>
              <CartProvider>
                <IsOpenProvider>
                  <ScannedProductProvider>
                    <HideNavCartWrapper>{children}</HideNavCartWrapper>
                  </ScannedProductProvider>
                </IsOpenProvider>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
