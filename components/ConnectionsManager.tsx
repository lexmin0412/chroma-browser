"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Edit, Server, Cloud, Database, AlertCircle } from 'lucide-react';
import { chromaService } from "@/app/utils/chroma-service";
import { IConnectionFlatItem, IConnectionItem, IChromaNormalConnectionFlatItem, IChromaCloudConnectionFlatItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type IFormData = Omit<IConnectionFlatItem, "id">;

interface ConnectionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSelect?: (connection: IConnectionItem) => void;
}

export default function ConnectionsManager({ isOpen, onClose, onConnectionSelect }: ConnectionsManagerProps) {
  const router = useRouter();
  const [connections, setConnections] = useState<IConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingConnection, setEditingConnection] = useState<IConnectionItem | null>(null);
  const [formData, setFormData] = useState<Partial<IConnectionFlatItem>>();

  // 获取连接列表
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/connections");
        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }
        const data = await response.json();
        setConnections(data);
      } catch (err) {
        setError("Failed to load connections");
        console.error("Error fetching connections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchConnections();
      setView('list'); // Reset view when opening
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof IFormData]: value }));
  };

  const handleAddConnection = () => {
    setEditingConnection(null);
    setFormData({ type: "ChromaNormal" });
    setView('form');
  };

  const handleEditConnection = (connection: IConnectionItem) => {
    setEditingConnection(connection);
    const editingFormData: Partial<IFormData> = {
      name: connection.name,
      type: connection.type,
      description: connection.description,
    };
    if (connection.type === "ChromaNormal") {
      Object.assign(editingFormData, {
        host: connection.config.host,
        port: connection.config.port,
      });
    } else {
      Object.assign(editingFormData, {
        apiKey: connection.config.apiKey,
        tenant: connection.config.tenant,
        database: connection.config.database,
      });
    }
    setFormData(editingFormData);
    setView('form');
  };

  const handleDeleteConnection = async (id: number) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      try {
        const response = await fetch(`/api/connections?id=${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete connection");
        }
        setConnections((prev) => prev.filter((conn) => conn.id !== id));
      } catch (err) {
        setError("Failed to delete connection");
        console.error("Error deleting connection:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) {
      return;
    }

    try {
      // 构建config对象
      const config = {};

      if (formData.type === "ChromaNormal") {
        Object.assign(config, {
          host: formData.host,
          port: formData.port,
        });
      } else if (formData.type === "ChromaCloud") {
        Object.assign(config, {
          apiKey: formData.apiKey,
          tenant: formData.tenant,
          database: formData.database,
        });
      }

      const connectionData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        config,
      };

      let response;
      if (editingConnection) {
        // 更新现有连接
        response = await fetch(`/api/connections?id=${editingConnection.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(connectionData),
        });
      } else {
        // 创建新连接
        response = await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(connectionData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save connection");
      }

      const data = await response.json();

      if (editingConnection) {
        // 更新本地连接列表
        setConnections((prev) =>
          prev.map((conn) => (conn.id === editingConnection.id ? data : conn))
        );
      } else {
        // 添加到本地连接列表
        setConnections((prev) => [...prev, data]);
      }

      // 关闭模态框并重置表单
      setView('list');
      setEditingConnection(null);
    } catch (err) {
      setError("Failed to save connection");
      console.error("Error saving connection:", err);
    }
  };

  const handleConnectionClick = (connection: IConnectionItem) => {
    chromaService.setCurrentConnection(connection.id);
    router.push(`/${connection.id}/collections`);
    onConnectionSelect?.(connection);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {view === 'list' ? 'Connection Manager' : (editingConnection ? 'Edit Connection' : 'Add Connection')}
          </DialogTitle>
          <DialogDescription>
            {view === 'list'
              ? 'Manage your vector database connections.'
              : 'Configure connection details.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-foreground">
                  Your Connections
                </h4>
                <Button onClick={handleAddConnection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Connection
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead className="w-[200px]">Connection Details</TableHead>
                          <TableHead>Scope (Tenant / DB)</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {connections.map((connection) => (
                          <TableRow
                            key={connection.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleConnectionClick(connection)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{connection.name}</span>
                                {connection.description && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {connection.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-xs font-medium border",
                                connection.type === "ChromaNormal"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                              )}>
                                {connection.type.replace("Chroma", "")}
                              </div>
                            </TableCell>
                            <TableCell>
                              {connection.type === "ChromaNormal" ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Server className="h-3 w-3 text-muted-foreground" />
                                  <span>{connection.config?.host}:{connection.config?.port}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm">
                                  <Cloud className="h-3 w-3 text-muted-foreground" />
                                  <span>Chroma Cloud API</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {connection.type === "ChromaCloud" ? (
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Tenant:</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="font-mono bg-muted/50 px-1 rounded max-w-[120px] truncate block">
                                          {connection.config?.tenant}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{connection.config?.tenant}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">DB:</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="font-mono bg-muted/50 px-1 rounded max-w-[120px] truncate block">
                                          {connection.config?.database}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{connection.config?.database}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditConnection(connection);
                                  }}
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConnection(connection.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {connections.length === 0 && (
                    <div className="mt-6">
                      <Empty>
                        <EmptyMedia>
                          <Database className="text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>No connections configured</EmptyTitle>
                          <EmptyDescription>
                            Add your first vector database connection to get started.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button onClick={handleAddConnection} variant="outline">
                            Add Your First Connection
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
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

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setView('list')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                  >
                    Save Connection
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
