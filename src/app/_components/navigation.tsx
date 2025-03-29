"use client";

import { useState } from "react";

export function Navigation() {
  const [mainCategory, setMainCategory] = useState("male");
  const [subCategory, setSubCategory] = useState("condoms"); // initial subcategory

  return (
    <div>
      {/* Header Section */}
      <header className="w-full h-32 bg-white shadow-md fixed right-10 left-0 top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-full">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <img src="./jpg.jpg" alt="Logo" className="h-25" />
          </div>

          {/* Top Navigation Links */}
          <nav className="hidden md:flex gap-10  text-red-700 font-bold">
            <button
              onClick={() => setMainCategory("male")}
              className="text-[20px]"
            >
              Эрэгтэй
            </button>
            <button
              onClick={() => setMainCategory("female")}
              className="text-[20px]"
            >
              Эмэгтэй
            </button>
            <button
              onClick={() => setMainCategory("couples")}
              className="text-[20px]"
            >
              Хосуудад
            </button>
            <button
              onClick={() => setMainCategory("partyGame")}
              className="text-[20px]"
            >
              Парти тоглоом
            </button>
          </nav>
        </div>
      </header>

      {/* Sidebar Section */}
      <aside
        className={`fixed top-32 left-0 h-full bg-[#ab3030] text-white transition-all w-56`}
      >
        {/* Sidebar Navigation Links */}
        <nav className="flex flex-col gap-6 p-4">
          {mainCategory === "male" ? (
            <div>
              {/* Subcategory for Male */}
              <div>
                <button
                  onClick={() => setSubCategory("condoms")}
                  className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
                >
                  Бэлгэвч
                </button>
                {subCategory === "condoms" && (
                  <div className="mt-2 ml-3 text-[10px] ">
                    Бэлгэвчний төрөл болон дэлгэрэнгүй мэдээлэл
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => setSubCategory("penis")}
                  className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
                >
                  Шодой
                </button>
                {subCategory === "penis" && (
                  <div className="mt-2 ml-3 text-[10px] ">
                    Шодойтой холбоотой мэдээлэл
                  </div>
                )}
              </div>
            </div>
          ) : mainCategory === "female" ? (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Эмэгтэй
            </a>
          ) : mainCategory === "couples" ? (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Хосуудад
            </a>
          ) : (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Парти тоглоом
            </a>
          )}
        </nav>
      </aside>
    </div>
  );
}
