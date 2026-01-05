'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import '@/worcoor/index.css';

// Dynamically import the LayoutBuilderWrapper to avoid SSR issues
const LayoutBuilderWrapper = dynamic(
  () => import('@/worcoor/integration/LayoutBuilderWrapper'),
  { ssr: false }
);

export default function LayoutBuilderPage() {
  const handleBack = () => {
    window.location.href = '/dashboard';
  };

  const handleSaveComplete = (layoutData: any) => {
    console.log('Layout saved:', layoutData);
    // You can add custom logic here, like showing a notification
  };

  return (
    <div className="layout-builder-page">
      <LayoutBuilderWrapper
        onBack={handleBack}
        onSaveComplete={handleSaveComplete}
        showBackButton={true}
      />
    </div>
  );
}
