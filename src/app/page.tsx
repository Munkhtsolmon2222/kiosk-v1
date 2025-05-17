"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next/client";
import Link from "next/link";
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
  const [currentIndex, setCurrentIndex] = useState<number>(0); // State to keep track of the current image index
  const defaultCategory = getCookie("defaultCategory");
  // const department = getCookie("department");
  // let selectedImages: any;
  // if (department == "Kegel") {
  //   selectedImages = imagesKegel;
  // } else if (department == "Utree") {
  //   selectedImages = imagesUtree;
  // } else if (department == "Shodoi") {
  //   selectedImages = imagesShodoi;
  // } else if (department == "Belgevch") {
  //   selectedImages = imagesBelgevch;
  // } else if (department == "Party") {
  //   selectedImages = imagesPartyToy;
  // } else if (department == "HiimelShodoi") {
  //   selectedImages = imagesHiimelShodoi;
  // } else if (department == "HuhniiPump") {
  //   selectedImages = imagesHuhniiPump;
  // } else if (department == "TaviltUdaashruulagch") {
  //   selectedImages = imagesTaviltUdaashruulagch;
  // } else if (department == "DotuurHuvtsas") {
  //   selectedImages = imagesDotuurhuvtsas;
  // }
  const images = ["./tsahimZovloh.jpg"];
  // useEffect(() => {
  //   const fetchImages = async () => {
  //     try {
  //       const res = await fetch("/api/fetchImages");
  //       const data = await res.json();

  //       if (data.resources && data.resources.length > 0) {
  //         const imageUrls = data.resources.map(
  //           (item: ImageData) => item.secure_url
  //         );
  //         setImages(imageUrls);
  //       } else {
  //         setImages(["./zurag.png"]);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching images:", error);

  //       setImages(["./zurag.png"]);
  //     }
  //   };

  //   fetchImages();
  // }, []);

  // Function to change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [images]);
  const { data, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log(data);
  console.log(images);
  return (
    <div>
      {defaultCategory ? (
        <div className="relative object-contain  ">
          <Link href={`/category/${defaultCategory}`}>
            <img
              src={images[currentIndex] || "./tsahimZovloh.jpg"} // Display image based on current index
              className="w-[100vw] h-screen mx-auto object-cover "
              alt="Category Image"
            />
          </Link>
        </div>
      ) : (
        <div className="relative">
          <Link href={`/category/45`}>
            <img
              src={images[currentIndex] || "./tsahimZovloh.jpg"} // Display image based on current index
              className="w-full h-screen mx-auto object-cover"
              alt="Category Image"
            />
          </Link>
        </div>
      )}

      {/* Additional content can go here */}
    </div>
  );
}
