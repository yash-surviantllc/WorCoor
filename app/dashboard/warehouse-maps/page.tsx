'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import '@/worcoor/index.css';

// Dynamically import the WarehouseMapWrapper to avoid SSR issues
const WarehouseMapWrapper = dynamic(
  () => import('@/worcoor/integration/WarehouseMapWrapper'),
  { ssr: false }
);

export default function WarehouseMapsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleNavigateToBuilder = () => {
    router.push('/dashboard/layout-builder');
  };

  const handleLayoutSelect = (layout: any) => {
    console.log('Layout selected:', layout);
    // You can add custom logic here
  };

  return (
    <div className="warehouse-maps-page">
      <WarehouseMapWrapper
        onBack={handleBack}
        onNavigateToBuilder={handleNavigateToBuilder}
        onLayoutSelect={handleLayoutSelect}
        showBackButton={true}
      />
    </div>
  );
}
