"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Home, Info, Briefcase, Phone, Menu, X } from "lucide-react";
export function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <header className="w-full h-32 bg-white shadow-md fixed right-20 top-0 z-50">
        <div className="container mx-auto flex items-center p-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://erchuudiindelguur.mn/wp-content/uploads/2024/10/Image_20250206182011-1.png"
              alt="Logo"
              className="h-20 w-[600px]"
            />
          </div>
          {/* Navigation Links */}
          <nav className="flex gap-10 text-red-700 font-bold w-fit mx-auto">
            {/* Dropdown for "БҮТЭЭГДЭХҮҮН" */}
            <button className="text-[20px]">Eregtei</button>
            <button className="text-[20px]">Emegtei</button>
            <button className="text-[20px]">Emegtei</button>
            <button className="text-[20px]">Emegtei</button>
          </nav>
        </div>
      </header>
      <aside
        className={`fixed left-0 top-0 h-full bg-[#ab3030] text-white transition-all ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-center p-4">
          <Button
            variant="ghost"
            className="text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-6 p-4">
          <a
            href="#"
            className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
          >
            category
          </a>
          <a
            href="#"
            className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
          >
            category
          </a>
          <a
            href="#"
            className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
          >
            category
          </a>
          <a
            href="#"
            className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
          >
            category
          </a>
        </nav>
      </aside>
    </div>
  );
}
