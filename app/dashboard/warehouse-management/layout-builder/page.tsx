'use client';

import { useEffect, useState } from 'react';
import WarehouseLayoutBuilder from '@/components/warehouse/WarehouseLayoutBuilder';
import '@/styles/warehouse.css';

export default function LayoutBuilderPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Layout Builder...</p>
      </div>
    );
  }

  return <WarehouseLayoutBuilder />;
}
