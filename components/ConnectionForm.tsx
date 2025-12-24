"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IConnectionFlatItem, IChromaNormalConnectionFlatItem, IChromaCloudConnectionFlatItem } from "@/types";

type IFormData = Omit<IConnectionFlatItem, "id">;

interface ConnectionFormProps {
  initialData?: Partial<IConnectionFlatItem>;
  onSubmit: (data: IFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ConnectionForm({ initialData, onSubmit, onCancel, isSubmitting = false }: ConnectionFormProps) {
  const [formData, setFormData] = useState<Partial<IFormData>>({
    type: "ChromaNormal",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ type: "ChromaNormal", ...initialData });
    } else {
        setFormData({ type: "ChromaNormal" });
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof IFormData]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onSubmit(formData as IFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData?.name || ""}
              onChange={handleInputChange}
              required
              placeholder="My Vector DB"
            />
          </div>

          <div className="grid gap-2">
            <Label>Connection Type</Label>
            <Tabs
              value={formData?.type || "ChromaNormal"}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val as "ChromaNormal" | "ChromaCloud" }))}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ChromaNormal">Normal (Local/Server)</TabsTrigger>
                <TabsTrigger value="ChromaCloud">Chroma Cloud</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="ChromaNormal" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="host">Host *</Label>
                      <Input
                        id="host"
                        name="host"
                        value={(formData as Partial<IChromaNormalConnectionFlatItem>)?.host || ""}
                        onChange={handleInputChange}
                        required={formData?.type === "ChromaNormal"}
                        placeholder="localhost"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="port">Port *</Label>
                      <Input
                        id="port"
                        type="number"
                        name="port"
                        value={(formData as Partial<IChromaNormalConnectionFlatItem>)?.port || ""}
                        onChange={handleInputChange}
                        required={formData?.type === "ChromaNormal"}
                        min="1"
                        max="65535"
                        placeholder="8000"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ChromaCloud" className="mt-0 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="apiKey">API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      name="apiKey"
                      value={(formData as unknown as IChromaCloudConnectionFlatItem)?.apiKey || ""}
                      onChange={handleInputChange}
                      required={formData?.type === "ChromaCloud"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tenant">Tenant *</Label>
                      <Input
                        id="tenant"
                        name="tenant"
                        value={(formData as unknown as IChromaCloudConnectionFlatItem)?.tenant || ""}
                        onChange={handleInputChange}
                        required={formData?.type === "ChromaCloud"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="database">Database *</Label>
                      <Input
                        id="database"
                        name="database"
                        value={(formData as unknown as IChromaCloudConnectionFlatItem)?.database || ""}
                        onChange={handleInputChange}
                        required={formData?.type === "ChromaCloud"}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData?.description || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Connection"}
        </Button>
      </div>
    </form>
  );
}
