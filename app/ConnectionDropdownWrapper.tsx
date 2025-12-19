'use client';

import React, { useState, useEffect } from 'react';
import ConnectionDropdown from '../components/ConnectionDropdown';
import { IConnectionItem } from '@/types';

export default function ConnectionDropdownWrapper() {
  const [connections, setConnections] = useState<IConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error("Error fetching connections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, []);

  return <ConnectionDropdown connections={connections} isLoading={isLoading} />;
}