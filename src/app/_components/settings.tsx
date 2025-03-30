import { AiFillSetting } from "react-icons/ai";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";

const ALLOWED_CODE = "123456";

export function Settings({ onSelectCategory, onSubCategory }: any) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);

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
    // Хадгалж байгаа сонголтууд
    onSelectCategory("Эрэгтэй"); // Категори
    onSubCategory("Хиймэл үтрээ"); // Дэд категори
    setIsCodeVerified(false);
    setOpen(false);
  };

  const handleClose = () => {
    setIsCodeVerified(false);
    setCode("");
    setOpen(false);
  };

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
                  onChange={(e) => onSelectCategory(e.target.value)} // Категорио сонгох
                >
                  <option value="Эрэгтэй">Эрэгтэй</option>
                  <option value="Эмэгтэй">Эмэгтэй</option>
                  <option value="Хосуудад">Хосуудад</option>
                  <option value="Парти">Парти тоглоом</option>
                </select>
                <select
                  className="border p-2 w-full"
                  onChange={(e) => onSubCategory(e.target.value)} // Дэд категорио сонгох
                >
                  <option value="Бэлгэвч">Бэлгэвч</option>
                  <option value="Хоолны нэмэлт">Хоолны нэмэлт</option>
                  <option value="Цэвэрлэгээ">Цэвэрлэгээ</option>
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
