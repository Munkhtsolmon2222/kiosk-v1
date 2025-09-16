import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../../providers/queryProvider";
import { ProductProvider } from "../../providers/productContext";
import { CategoryProvider } from "../../providers/CategoriesContext";
import { CartProvider } from "../../providers/cartContext";
import { IsOpenProvider } from "../../providers/isOpenContext";
import HideNavCartWrapper from "./_components/hideNavCartWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "call me baby 89005845",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-oswald antialiased`}
      >
        <QueryProvider>
          <ProductProvider>
            <CategoryProvider>
              <CartProvider>
                <IsOpenProvider>
                  <HideNavCartWrapper>{children}</HideNavCartWrapper>
                </IsOpenProvider>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
