"use client";
import { AiFillSetting } from "react-icons/ai";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { useCategories } from "../../../providers/CategoriesContext";

const ALLOWED_CODE = "123456";

export function Settings({
  onSelectCategory,
  onSubCategory,
  onThirdCategory,
}: any) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const {
    data,
    isLoading,
    isError,
    error,
    setMainCategory,
    mainCategory,
    setSubCategory,
    subCategory,
    setThirdCategory,
    thirdCategory,
  } = useCategories(); // Consume the context
  const [selectedCategory, setSelectedCategory] = useState(mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [selectedThirdCategory, setSelectedThirdCategory] =
    useState<number>(thirdCategory);

  const handleOpen = () => {
    setOpen(true);
    setIsCodeVerified(false);
  };

  const handleVerifyCode = () => {
    if (code === ALLOWED_CODE) {
      setIsCodeVerified(true);
    } else {
      alert("❌ Буруу код эсвэл дугаар байна!");
    }
    setCode("");
  };

  const handleSave = () => {
    onSelectCategory(selectedCategory); // Set main category
    onSubCategory(selectedSubCategory); // Set subcategory
    onThirdCategory(selectedThirdCategory); // Set third category
    setIsCodeVerified(false);
    setOpen(false);
  };

  const handleClose = () => {
    setIsCodeVerified(false);
    setCode("");
    setOpen(false);
  };

  useEffect(() => {
    // When mainCategory changes, clear the subcategory and third category selections
    setSelectedCategory(mainCategory);
    setSelectedSubCategory("");
    setSelectedThirdCategory(thirdCategory);
  }, [mainCategory, thirdCategory]);

  const categories = data || [];
  const subCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.name === selectedCategory)?.id || null)
  );
  const thirdCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.name === selectedSubCategory)?.id || null)
  );

  return (
    <div className="flex justify-center items-center">
      <Button variant="outline" onClick={handleOpen}>
        <AiFillSetting className="text-xl" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="fixed inset-0 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle className="sr-only">Тохиргоо</DialogTitle>

            {/* Код шалгах хэсэг */}
            {!isCodeVerified ? (
              <div className="grid gap-4 py-4">
                <label className="block text-sm font-medium">Нэвтрэх код</label>
                <input
                  type="password"
                  placeholder="Кодоо оруулна уу"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border p-2 w-full"
                />
                <button
                  onClick={handleVerifyCode}
                  className="mt-4 p-2 bg-blue-500 text-white rounded w-full"
                >
                  Нэвтрэх
                </button>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <select
                  className="border p-2 w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)} // Категорио сонгох
                >
                  <option value="Эрэгтэй">Эрэгтэй</option>
                  <option value="Эмэгтэй">Эмэгтэй</option>
                  <option value="Хосуудад">Хосуудад</option>
                  <option value="Парти">Парти тоглоом</option>
                </select>

                <select
                  className="border p-2 w-full"
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)} // Дэд категорио сонгох
                >
                  {subCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.name}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>

                <select
                  className="border p-2 w-full"
                  value={selectedThirdCategory}
                  onChange={(e) =>
                    setSelectedThirdCategory(Number(e.target.value))
                  } // Гуравдугаар категорио сонгох
                >
                  {thirdCategories.map((thirdCategory) => (
                    <option key={thirdCategory.id} value={thirdCategory.id}>
                      {thirdCategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Хадгалах болон Болих товчнууд */}
            {isCodeVerified && (
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Болих
                </Button>
                <Button onClick={handleSave}>Хадгалах</Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
