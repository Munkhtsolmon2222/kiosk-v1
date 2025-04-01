import { AiFillSetting } from "react-icons/ai";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { useCategories } from "../../../providers/CategoriesContext";
import {
  getCookie,
  getCookies,
  setCookie,
  deleteCookie,
  hasCookie,
  useGetCookies,
  useSetCookie,
  useHasCookie,
  useDeleteCookie,
  useGetCookie,
} from "cookies-next/client";
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
    data1,
    isLoading,
    isError,
    error,
    setMainCategory,
    mainCategory,
    setSubCategory,
    subCategory,
    setThirdCategory,
    thirdCategory,
  } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<any>(mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>("");
  const [selectedThirdCategory, setSelectedThirdCategory] =
    useState<any>(thirdCategory);
  const [email, setEmail] = useState(getCookie("clientEmail") || "");
  const [emailError, setEmailError] = useState("");
  // Error state for category selection
  const [categoryError, setCategoryError] = useState({
    mainCategory: false,
    subCategory: false,
    thirdCategory: false,
  });

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
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Зөв имэйл хаяг оруулна уу.");
      return;
    }
    // Reset errors
    setCategoryError({
      mainCategory: false,
      subCategory: false,
      thirdCategory: false,
    });

    // Check if categories are selected properly (not the placeholder option)
    if (selectedCategory === "choose category") {
      valid = false;
      setCategoryError((prev) => ({ ...prev, mainCategory: true }));
    }
    if (selectedSubCategory === "choose category") {
      valid = false;
      setCategoryError((prev) => ({ ...prev, subCategory: true }));
    }
    if (selectedThirdCategory === "choose category" || !selectedThirdCategory) {
      valid = false;
      setCategoryError((prev) => ({ ...prev, thirdCategory: true }));
    }

    // If any category is not selected correctly, show alert and return
    if (!valid) {
      alert("Please select all required categories.");
      return;
    }

    // Execute the category selection callbacks
    onSelectCategory(selectedCategory);
    onSubCategory(selectedSubCategory);
    onThirdCategory(selectedThirdCategory);

    if (selectedThirdCategory && selectedCategory) {
      setCookie("defaultCategory", selectedThirdCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryMain", selectedCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategorySub", selectedSubCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryThird", selectedThirdCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("clientEmail", email, { maxAge: 3650 * 24 * 60 * 60 });
      console.log("setting", selectedThirdCategory);
    } else {
      setCookie("defaultCategory", selectedSubCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryMain", selectedCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategorySub", selectedSubCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryThird", selectedThirdCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("clientEmail", email, { maxAge: 3650 * 24 * 60 * 60 });
      console.log("setting", selectedSubCategory);
    }

    // Reset the state and close the dialog
    setIsCodeVerified(false);
    setOpen(false);
  };

  const handleClose = () => {
    setIsCodeVerified(false);
    setCode("");
    setOpen(false);
  };

  useEffect(() => {
    setSelectedCategory(mainCategory);
    setSelectedSubCategory("");
    setSelectedThirdCategory(thirdCategory);
  }, [mainCategory, thirdCategory]);

  const categories = data1 || [];
  const subCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.name === selectedCategory)?.id || null)
  );
  const thirdCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.id === Number(selectedSubCategory))?.id || null)
  );
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  console.log(selectedCategory);

  console.log(selectedSubCategory);
  console.log(thirdCategories, subCategories);
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

            {/* Code Verification Section */}
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
                <div className="grid gap-4 py-4">
                  <label className="block text-sm font-medium">Имэйл</label>
                  <input
                    type="email"
                    placeholder="Имэйлээ оруулна уу"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full"
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>
                {/* Main Category Selection */}
                <div>
                  <select
                    className={`border p-2 w-full ${
                      categoryError.mainCategory ? "border-red-500" : ""
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="choose category">
                      Choose main category
                    </option>
                    <option value="Эрэгтэй">Эрэгтэй</option>
                    <option value="Эмэгтэй">Эмэгтэй</option>
                    <option value="Хосуудад">Хосуудад</option>
                    <option value="Парти">Парти тоглоом</option>
                  </select>
                  {categoryError.mainCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a main category.
                    </p>
                  )}
                </div>

                {/* Sub Category Selection */}
                <div>
                  <select
                    className={`border p-2 w-full ${
                      categoryError.subCategory ? "border-red-500" : ""
                    }`}
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                  >
                    <option value="choose category">Choose subcategory</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  {categoryError.subCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a subcategory.
                    </p>
                  )}
                </div>

                {/* Third Category Selection (Optional) */}
                {thirdCategories.length > 0 && (
                  <div>
                    <select
                      className={`border p-2 w-full ${
                        categoryError.thirdCategory ? "border-red-500" : ""
                      }`}
                      value={selectedThirdCategory}
                      onChange={(e) =>
                        setSelectedThirdCategory(Number(e.target.value))
                      }
                    >
                      <option value="choose category">
                        Choose third category
                      </option>
                      {thirdCategories.map((thirdCategory) => (
                        <option key={thirdCategory.id} value={thirdCategory.id}>
                          {thirdCategory.name}
                        </option>
                      ))}
                    </select>
                    {categoryError.thirdCategory && (
                      <p className="text-red-500 text-sm mt-1">
                        Please select a third category.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Save and Close Buttons */}
            {isCodeVerified && (
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Болих
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    selectedCategory === "choose category" ||
                    selectedSubCategory === "choose category"
                  }
                >
                  Хадгалах
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
