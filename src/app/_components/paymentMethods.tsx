import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

const paymentMethods = [
  {
    id: "qpay",
    label: "Qpay",
    description: "Qpay ашиглан банкны апп-аар төлбөрөө төлөөрэй",
  },
  {
    id: "storepay",
    label: "Storepay",
    description: "Storepay ашиглан 3-6 хуваан төлөөрэй.",
    extraField: "Утасны дугаар",
    extraInfo: [
      "1. Та утасны дугаараа оруулаад Үргэлжлүүлэх товч дарна уу",
      "2. Захиалгаа Storepay app-аар үргэлжлүүлэн төлбөрөө төлнө үү.",
      "3. Төлбөр амжилттай төлөгдсөн бол захиалга баталгаажна.",
      "/Storepay-ээр төлж байгаа тохиолдолд НӨАТ хасахгүй/",
    ],
  },
];

export default function PaymentMethods({
  methodError,
  setMethodError,
  selected,
  setSelected,
  handleSubmitForMethod,
  setPhoneNumber,
  phoneNumber,
  setPhoneError,
  phoneError,
}: {
  methodError: any;
  setMethodError: any;
  selected: any;
  setSelected: any;
  handleSubmitForMethod: any;
  setPhoneNumber: any;
  phoneNumber: any;
  setPhoneError: any;
  phoneError: any;
}) {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">ТӨЛБӨРИЙН ХЭРЭГСЭЛ</h2>
      <RadioGroup value={selected} onValueChange={setSelected}>
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "p-4 mb-2 border cursor-pointer",
              selected === method.id ? "border-red-500" : "border-gray-300"
            )}
            onClick={() => setSelected(method.id)}
          >
            <RadioGroupItem
              value={method.id}
              id={method.id}
              className="hidden"
            />
            <div className="flex items-center">
              {selected === method.id ? (
                <CheckCircle className="text-red-500 mr-3" />
              ) : (
                <Circle className="text-gray-400 mr-3" />
              )}
              <div>
                <Label htmlFor={method.id} className="text-base font-medium">
                  {method.label}
                </Label>
                {method.description && (
                  <p className="text-sm text-gray-500">{method.description}</p>
                )}
              </div>
            </div>
            {selected === method.id && method.extraField && (
              <div className="mt-2">
                <Label className="text-sm font-medium">
                  {method.extraField} *
                </Label>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Утасны дугаар"
                  className="mt-1 w-full border ${phoneError ? 'border-red-500' : 'border-gray-300'}"
                />
                {phoneError && (
                  <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                )}
                <ul className="mt-2 text-xs text-gray-500">
                  {method.extraInfo.map((info, index) => (
                    <li key={index}>{info}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </RadioGroup>
      {methodError && (
        <p className="text-xs text-red-500 mt-2">{methodError}</p>
      )}
    </div>
  );
}
