// components/HideNavCartWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { Cart } from "./cart";
import { Navigation } from "./navigation";

export default function HideNavCartWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide Navigation and Cart for specific paths
  const hideNavigationAndCart = ["/"].includes(pathname);

  if (hideNavigationAndCart) return <>{children}</>; // Only render children if path matches

  return (
    <>
      <Navigation />
      {children}
      <Cart />
    </>
  );
}
