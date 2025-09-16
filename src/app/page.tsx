"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "../../providers/productContext";
// import { imagesKegel, imagesUtree } from "@/lib/images";
// import { imagesShodoi } from "@/lib/images";
// import { imagesBelgevch } from "@/lib/images";
// import { imagesBDSM } from "@/lib/images";
// import { imagesPartyToy } from "@/lib/images";
// import { imagesHiimelShodoi } from "@/lib/images";
// import { imagesHuhniiPump } from "@/lib/images";
// import { imagesTaviltUdaashruulagch } from "@/lib/images";
// import { imagesDotuurhuvtsas } from "@/lib/images";

// Define types for image data
type ImageData = {
  secure_url: string;
};

export default function Home() {
  const router = useRouter();
  const defaultCategory = getCookie("defaultCategory");
  const { data, isLoading, error } = useProducts();

  // Redirect immediately to category page
  useEffect(() => {
    if (!isLoading && !error) {
      // Use defaultCategory if available, otherwise redirect to category 45
      const categoryId = defaultCategory || "45";
      router.push(`/category/${categoryId}`);
    }
  }, [isLoading, error, defaultCategory, router]);

  // Show loading state while redirecting
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // This will show briefly before redirect
  return <div>Redirecting...</div>;
}
