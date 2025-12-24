"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import ConnectionForm from "./ConnectionForm";
import { IConnectionFlatItem } from "@/types";

interface ConnectionFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<IConnectionFlatItem>;
  onSubmit: (data: Omit<IConnectionFlatItem, "id">) => Promise<void>;
  title?: string;
}

export default function ConnectionFormDrawer({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  title
}: ConnectionFormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-[90vw] px-6">
        <SheetHeader className="px-1">
          <SheetTitle>{title || (initialData ? "Edit Connection" : "Add Connection")}</SheetTitle>
          <SheetDescription>
            Configure your ChromaDB connection details.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 h-full pb-10 px-1">
          <ConnectionForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
