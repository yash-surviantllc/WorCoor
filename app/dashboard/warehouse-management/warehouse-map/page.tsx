'use client';

import { useEffect, useState } from 'react';
import WarehouseMapView from '@/components/warehouse/WarehouseMapView';
import '@/styles/warehouse.css';

export default function WarehouseMapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Warehouse Map...</p>
      </div>
    );
  }

  const facilityData = {};
  
  return <WarehouseMapView facilityData={facilityData} />;
}
