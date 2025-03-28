"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const images = [
  "https://res.cloudinary.com/dv7ytfkgc/image/upload/v1737701571/gzkoigbdymm368tfujjr.jpg",
  "https://res.cloudinary.com/dv7ytfkgc/image/upload/v1737547269/dhz8qebpvfcknigmiu9g.webp",
  "https://res.cloudinary.com/dv7ytfkgc/image/upload/v1737540473/mld7ftnlvzyat8bqz3dx.png",
];

export default function ProductCard() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center mt-10">
          <div className="w-60 h-auto bg-[#f1f1f1] rounded-2xl p-4">
            <img
              src="./1.jpg"
              alt="Aaviin Baraa"
              className="w-20 h-20 object-cover mx-auto rounded-full"
            />
            <h2 className="text-[#ab3030] text-center mt-4">Aaviin Baraa</h2>
            <h3 className="text-black text-center mt-2">₮100'000</h3>
            <h5 className="text-[#5dc477] text-center mt-1">Бэлэн</h5>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="p-6 min-w-[70vw] min-h-[80vh] flex flex-col overflow-y-auto">
        <Swiper
          spaceBetween={10}
          slidesPerView={1}
          loop={true} // Enable looping for continuous swipe
          pagination={{ clickable: true }} // Add clickable pagination dots
          navigation={true} // Add next/prev buttons
          modules={[Pagination, Navigation]} // Import necessary modules
          className="w-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`Product Image ${index + 1}`}
                className="rounded-lg w-[822px] h-[514px] object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <DialogHeader className=" mt-6">
          <DialogTitle className="text-4xl font-bold flex justify-between p-4">
            <div>
              <p className="text-2xl text-gray-500">Код: 123456</p>
              <p className="text-4xl font-bold">
                {" "}
                Maxime pariatur minus delectus Жишээ Бараа
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">
                <span className="text-gray-500 line-through text-2xl block">
                  24,900₮
                </span>{" "}
                19,900₮
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="text-xl mt-4 px-4 w-full text-center">
          <p className="text-gray-600 mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus ea
            facilis sequi natus iure. Maxime pariatur minus delectus officia
            blanditiis, nulla aperiam vel iure atque accusamus, sequi non nam
            eius?
          </p>
        </div>

        <div className="flex justify-between mt-10 w-2/3 mx-auto">
          <DialogClose asChild>
            <Button variant="outline" className="text-2xl px-8 py-4">
              Хаах
            </Button>
          </DialogClose>
          <Button className="text-2xl px-8 py-4 bg-green-500 text-white">
            Сагсанд нэмэх
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
