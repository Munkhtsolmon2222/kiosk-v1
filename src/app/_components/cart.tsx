"use client";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "./navigation";
import { useState } from "react";
import { AiFillSetting } from "react-icons/ai";

export function Cart() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        <AiFillSetting className="text-xl" />
      </Button>
      {open ? <div></div> : ""}
    </>
  );
}
