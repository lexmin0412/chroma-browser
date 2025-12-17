'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { chromaService } from '../utils/chroma-service';

interface Connection {
  id: number;
  name: string;
  type: 'ChromaNormal' | 'ChromaCloud';
  host?: string;
  port?: number;
  apiKey?: string;
  tenant?: string;
  database?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ChromaNormal' as 'ChromaNormal' | 'ChromaCloud',
    host: '',
    port: '',
    apiKey: '',
    tenant: '',
    database: '',
    description: ''
  });

  // 获取连接列表
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/connections');
        if (!response.ok) {
          throw new Error('Failed to fetch connections');
        }
        const data = await response.json();
        setConnections(data);
      } catch (err) {
        setError('Failed to load connections');
        console.error('Error fetching connections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddConnection = () => {
    setEditingConnection(null);
    setFormData({
      name: '',
      type: 'ChromaNormal',
      host: '',
      port: '',
      apiKey: '',
      tenant: '',
      database: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      type: connection.type,
      host: connection.host || '',
      port: connection.port?.toString() || '',
      apiKey: connection.apiKey || '',
      tenant: connection.tenant || '',
      database: connection.database || '',
      description: connection.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteConnection = async (id: number) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      try {
        const response = await fetch(`/api/connections?id=${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to delete connection');
        }
        setConnections(prev => prev.filter(conn => conn.id !== id));
      } catch (err) {
        setError('Failed to delete connection');
        console.error('Error deleting connection:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const connectionData = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : undefined
      };

      let response;
      if (editingConnection) {
        // 更新现有连接
        response = await fetch(`/api/connections?id=${editingConnection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(connectionData)
        });
      } else {
        // 创建新连接
        response = await fetch('/api/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(connectionData)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save connection');
      }

      const data = await response.json();

      if (editingConnection) {
        // 更新本地连接列表
        setConnections(prev => prev.map(conn =>
          conn.id === editingConnection.id ? data : conn
        ));
      } else {
        // 添加到本地连接列表
        setConnections(prev => [...prev, data]);
      }

      // 关闭模态框并重置表单
      setIsModalOpen(false);
      setEditingConnection(null);
    } catch (err) {
      setError('Failed to save connection');
      console.error('Error saving connection:', err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vector Database Connections</h1>
        <button
          onClick={handleAddConnection}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          Add Connection
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <Link
            key={connection.id}
            href="/collections"
            onClick={() => chromaService.setCurrentConnection(connection.id)}
            className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:cursor-pointer"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {connection.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${connection.type === 'ChromaNormal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                  {connection.type.replace('Chroma', '')}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {connection.type === 'ChromaNormal' && (
                  <>
                    <div><strong>Host:</strong> {connection.host}</div>
                    <div><strong>Port:</strong> {connection.port}</div>
                  </>
                )}
                {connection.type === 'ChromaCloud' && (
                  <>
                    <div><strong>Tenant:</strong> {connection.tenant}</div>
                    <div><strong>Database:</strong> {connection.database}</div>
                  </>
                )}
                {connection.description && (
                  <div><strong>Description:</strong> {connection.description}</div>
                )}
                <div className="text-xs text-slate-500 mt-2">
                  Created: {new Date(connection.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 防止触发 Link 的点击事件
                    handleEditConnection(connection);
                  }}
                  className="px-3 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 防止触发 Link 的点击事件
                    handleDeleteConnection(connection.id);
                  }}
                  className="px-3 py-2 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {connections.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No connections configured yet</p>
          <button
            onClick={handleAddConnection}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
          >
            Add Your First Connection
          </button>
        </div>
      )}

      {/* 添加/编辑连接模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl transform transition-all w-full max-w-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingConnection ? 'Edit Connection' : 'Add Connection'}
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
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Connection Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="ChromaNormal">Chroma Normal</option>
                      <option value="ChromaCloud">Chroma Cloud</option>
                    </select>
                  </div>

                  {formData.type === 'ChromaNormal' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Host *
                        </label>
                        <input
                          type="text"
                          name="host"
                          value={formData.host}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Port *
                        </label>
                        <input
                          type="number"
                          name="port"
                          value={formData.port}
                          onChange={handleInputChange}
                          required
                          min="1"
                          max="65535"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          API Key *
                        </label>
                        <input
                          type="text"
                          name="apiKey"
                          value={formData.apiKey}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Tenant *
                        </label>
                        <input
                          type="text"
                          name="tenant"
                          value={formData.tenant}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Database *
                        </label>
                        <input
                          type="text"
                          name="database"
                          value={formData.database}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
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
  );
}
