"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { chromaService } from "@/app/utils/chroma-service";
import { IConnectionFlatItem, IConnectionItem } from "@/types";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    fetchConnections();
  }, []);

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
    setFormData(undefined);
    setIsModalOpen(true);
  };

  const handleEditConnection = (connection: IConnectionItem) => {
    setEditingConnection(connection);
    let editingFormData: Partial<IFormData> = {
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
    setIsModalOpen(true);
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
      setIsModalOpen(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              连接管理
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                Vector Database Connections
              </h4>
              <button
                onClick={handleAddConnection}
                className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Add Connection
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon icon="heroicons:arrow-path" className="w-5 h-5 animate-spin" />
                  Loading...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    onClick={() => handleConnectionClick(connection)}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {connection.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            connection.type === "ChromaNormal"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {connection.type.replace("Chroma", "")}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {connection.type === "ChromaNormal" && (
                          <>
                            <div>
                              <strong>Host:</strong> {connection.config?.host}
                            </div>
                            <div>
                              <strong>Port:</strong> {connection.config?.port}
                            </div>
                          </>
                        )}
                        {connection.type === "ChromaCloud" && (
                          <>
                            <div>
                              <strong>Tenant:</strong> {connection.config?.tenant}
                            </div>
                            <div>
                              <strong>Database:</strong> {connection.config?.database}
                            </div>
                          </>
                        )}
                        {connection.description && (
                          <div>
                            <strong>Description:</strong> {connection.description}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditConnection(connection);
                          }}
                          className="px-3 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConnection(connection.id);
                          }}
                          className="px-3 py-1 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 空状态 */}
            {!isLoading && connections.length === 0 && (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  No connections configured yet
                </p>
                <button
                  onClick={handleAddConnection}
                  className="mt-4 px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Add Your First Connection
                </button>
              </div>
            )}
          </div>

          {/* 添加/编辑连接模态框 */}
          {isModalOpen && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
              />
              <div className="flex min-h-screen items-center justify-center p-4">
                <div
                  className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all w-full max-w-lg animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {editingConnection ? "Edit Connection" : "Add Connection"}
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData?.name || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Connection Type *
                        </label>
                        <select
                          name="type"
                          value={formData?.type || "ChromaNormal"}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                          <option value="ChromaNormal">Chroma Normal</option>
                          <option value="ChromaCloud">Chroma Cloud</option>
                        </select>
                      </div>

                      {formData?.type === "ChromaNormal" ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Host *
                            </label>
                            <input
                              type="text"
                              name="host"
                              value={formData?.host || ""}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Port *
                            </label>
                            <input
                              type="number"
                              name="port"
                              value={formData?.port || ""}
                              onChange={handleInputChange}
                              required
                              min="1"
                              max="65535"
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                        </>
                      ) : formData?.type === "ChromaCloud" ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              API Key *
                            </label>
                            <input
                              type="text"
                              name="apiKey"
                              value={formData?.apiKey || ""}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Tenant *
                            </label>
                            <input
                              type="text"
                              name="tenant"
                              value={formData?.tenant || ""}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Database *
                            </label>
                            <input
                              type="text"
                              name="database"
                              value={formData?.database || ""}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                        </>
                      ) : null}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          name="description"
                          value={formData?.description || ""}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
