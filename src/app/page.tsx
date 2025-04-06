"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next/client";
import Link from "next/link";

// Define types for image data
type ImageData = {
  secure_url: string;
};

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0); // State to keep track of the current image index
  const defaultCategory = getCookie("defaultCategory");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/fetchImages");
        const data = await res.json();

        if (data.resources && data.resources.length > 0) {
          const imageUrls = data.resources.map(
            (item: ImageData) => item.secure_url
          );
          setImages(imageUrls);
        } else {
          setImages(["./zurag.png"]);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages(["./zurag.png"]);
      }
    };

    fetchImages();
  }, []);

  // Function to change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [images]);
  console.log(images);
  return (
    <div className="">
      {defaultCategory ? (
        <div className="relative">
          <Link href={`/category/${defaultCategory}`}>
            <img
              src={images[currentIndex] || "./zurag.png"} // Display image based on current index
              className="w-full h-screen mx-auto object-cover "
              alt="Category Image"
            />
          </Link>
        </div>
      ) : (
        <div className="relative">
          <Link href={`/category/71`}>
            <img
              src={images[currentIndex] || "./zurag.png"} // Display image based on current index
              className="w-full h-screen mx-auto object-cover rounded-xl"
              alt="Category Image"
            />
          </Link>
        </div>
      )}

      {/* Additional content can go here */}
    </div>
  );
}
