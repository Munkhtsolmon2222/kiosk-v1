import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function ProductDialog({
  open,
  onOpenChange,
}: {
  open: any;
  onOpenChange: any;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 max-w-lg">
        <Image
          src="/grilled-chicken-club.jpg"
          alt="Grilled Chicken Club Sandwich"
          width={500}
          height={300}
          className="rounded-lg"
        />
        <DialogHeader>
          <DialogTitle>Grilled Chicken Club Sandwich</DialogTitle>
          <DialogDescription>
            A lemon-herb marinated boneless breast of chicken, grilled for a
            tender and juicy backyard-smoky taste, served on a toasted
            multigrain brioche bun with Colby Jack cheese, applewood smoked
            bacon, green leaf lettuce, and tomato. Pairs well with Honey Roasted
            BBQ Sauce.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 text-center text-sm font-medium">
          <Card>
            <CardContent className="p-2">520 Cal</CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">22g Fat</CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">45g Carbs</CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">38g Protein</CardContent>
          </Card>
        </div>
        <div className="text-sm mt-2">
          <p className="font-semibold">Includes:</p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Honey Roasted BBQ Sauce</li>
            <li>Multigrain Brioche Bun (210 Cal)</li>
            <li>Tomato (5 Cal)</li>
            <li>Lettuce (5 Cal)</li>
            <li>Bacon (50 Cal)</li>
          </ul>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline">Back</Button>
          <Button>Customize</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
