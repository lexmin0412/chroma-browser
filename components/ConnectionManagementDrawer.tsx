"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { chromaService } from "@/app/utils/chroma-service";
import { IConnectionFlatItem, IConnectionItem } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ConnectionList from "./ConnectionList";
import ConnectionFormDrawer from "./ConnectionFormDrawer";

interface ConnectionManagementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionSelect?: (connection: IConnectionItem) => void;
}

export default function ConnectionManagementDrawer({ open, onOpenChange, onConnectionSelect }: ConnectionManagementDrawerProps) {
  const router = useRouter();
  const [connections, setConnections] = useState<IConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for nested form drawer
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<IConnectionItem | null>(null);
  const [editingFormData, setEditingFormData] = useState<Partial<IConnectionFlatItem>>();

  // Fetch connections
  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/connections");
      if (!response.ok) throw new Error("Failed to fetch connections");
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError("Failed to load connections");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchConnections();
    }
  }, [open]);

  const handleAddConnection = () => {
    setEditingConnection(null);
    setEditingFormData({ type: "ChromaNormal" });
    setIsFormOpen(true);
  };

  const handleEditConnection = (connection: IConnectionItem) => {
    setEditingConnection(connection);
    // Flatten data for form
    const flatData: Partial<IConnectionFlatItem> = {
      name: connection.name,
      type: connection.type,
      description: connection.description,
      ...(connection.type === "ChromaNormal" ? {
        host: connection.config.host,
        port: connection.config.port,
      } : {
        apiKey: connection.config.apiKey,
        tenant: connection.config.tenant,
        database: connection.config.database,
      })
    };
    setEditingFormData(flatData);
    setIsFormOpen(true);
  };

  const handleDeleteConnection = async (id: number) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      try {
        const response = await fetch(`/api/connections?id=${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete");
        setConnections(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error(err);
        setError("Failed to delete connection");
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
      try {
          const config = {};
          if (formData.type === "ChromaNormal") {
            Object.assign(config, { host: formData.host, port: formData.port });
          } else {
            Object.assign(config, { apiKey: formData.apiKey, tenant: formData.tenant, database: formData.database });
          }

          const connectionData = {
            name: formData.name,
            type: formData.type,
            description: formData.description,
            config,
          };

          let response;
          if (editingConnection) {
            response = await fetch(`/api/connections?id=${editingConnection.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(connectionData),
            });
          } else {
            response = await fetch("/api/connections", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(connectionData),
            });
          }

          if (!response.ok) throw new Error("Failed to save");

          await fetchConnections();
          setIsFormOpen(false);
      } catch (err) {
          console.error(err);
          alert("Failed to save connection");
      }
  };

  const handleConnectionClick = (connection: IConnectionItem) => {
    chromaService.setCurrentConnection(connection.id);
    router.push(`/${connection.id}/collections`);
    onConnectionSelect?.(connection);
    onOpenChange(false);
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-5xl w-[90vw] flex flex-col gap-0 overflow-hidden" side="right">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Connection Management</SheetTitle>
          <SheetDescription>Manage your vector database connections.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-medium">Your Connections</h4>
                <Button onClick={handleAddConnection} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <ConnectionList
                    connections={connections}
                    onSelect={handleConnectionClick}
                    onEdit={handleEditConnection}
                    onDelete={handleDeleteConnection}
                />
            )}
        </div>
      </SheetContent>
    </Sheet>

    <ConnectionFormDrawer
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingFormData}
        onSubmit={handleFormSubmit}
    />
    </>
  );
}
