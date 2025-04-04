"use client";

import { useEffect, useState } from "react";
import { useProducts } from "../../providers/productContext";
import { getCookie } from "cookies-next/client";
import { AiFillSetting } from "react-icons/ai";
import ProductCard from "./_components/product";
import Link from "next/link";

export default function Home() {
  const [setting, setSetting] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [isClient, setIsClient] = useState(false); // To check if we're on the client-side
  const { data, isLoading, error } = useProducts();
  const defaultCategory = getCookie("defaultCategory");

  // useEffect(() => {
  //   setIsClient(true); // This ensures we are running on the client-side
  // }, []);

  // useEffect(() => {
  //   if (isClient && idleTime >= 30) {
  //     window.location.href = "http://localhost:3000"; // redirect after 30 seconds of inactivity
  //   }
  // }, [idleTime, isClient]);

  // useEffect(() => {
  //   if (!isClient) return; // Skip if we're on the server-side
  //   const interval = setInterval(() => {
  //     setIdleTime((prevTime) => prevTime + 1);
  //   }, 1000);

  //   // Clean up
  //   return () => clearInterval(interval);
  // }, [isClient]);

  // const handleUserActivity = () => {
  //   setIdleTime(0); // Reset idle time on user activity
  // };

  // // Hook for user activity
  // useEffect(() => {
  //   if (!isClient) return; // Skip if we're on the server-side
  //   window.addEventListener("mousemove", handleUserActivity);
  //   window.addEventListener("keydown", handleUserActivity);

  //   // Clean up event listeners on component unmount
  //   return () => {
  //     window.removeEventListener("mousemove", handleUserActivity);
  //     window.removeEventListener("keydown", handleUserActivity);
  //   };
  // }, [isClient]);
  // console.log("hello");
  // console.log(idleTime);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-44 ml-64">
      {/* {defaultCategory ? (
        <div className="relative">
          <Link href={`/category/${defaultCategory}`}>
            <video
              className="fixed top-0 left-0 w-full h-full object-cover rounded-lg shadow-lg"
              autoPlay
              muted // Видео эхлэх үед дуугүй байна
              loop
            >
              <source src="/video.mp4" type="video/mp4" />
              Таны браузер видео элементийг дэмжихгүй байна.
            </video>
          </Link>
        </div>
      ) : (
        <div>Video болгохгүй байна.</div>
      )} */}

      {/* Products */}
      {data?.pages.flatMap((page) => page.data).length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {data?.pages
            .flatMap((page) => page.data)
            .map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setSetting((prev) => !prev)}
        className="absolute top-4 right-4 p-2 bg-gray-800 text-white rounded"
      >
        <AiFillSetting />
      </button>
      {setting && <div>Settings Panel</div>}
    </div>
  );
}
