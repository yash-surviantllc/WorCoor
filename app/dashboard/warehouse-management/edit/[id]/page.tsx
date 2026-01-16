'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WarehouseLayoutBuilder from '@/components/warehouse/WarehouseLayoutBuilder';
import '@/styles/warehouse.css';

export default function EditLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const [layoutData, setLayoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const layoutId = params.id as string;
    
    if (!layoutId) {
      setError('No layout ID provided');
      setLoading(false);
      return;
    }

    // Load layouts from localStorage
    const storedLayouts = localStorage.getItem('warehouseLayouts');
    if (!storedLayouts) {
      setError('No saved layouts found');
      setLoading(false);
      return;
    }

    try {
      const layouts = JSON.parse(storedLayouts);
      console.log('All layouts:', layouts);
      console.log('Looking for layout ID:', layoutId);
      
      const layout = layouts.find((l: any) => l.id === layoutId);
      console.log('Found layout:', layout);
      
      // Detailed structure debugging
      if (layout) {
        console.log('Layout structure analysis:');
        console.log('- layout.id:', layout.id);
        console.log('- layout.name:', layout.name);
        console.log('- layout.orgUnit:', layout.orgUnit);
        console.log('- layout.layoutData exists:', !!layout.layoutData);
        console.log('- layout.layoutData.items:', layout.layoutData?.items);
        console.log('- layout.layoutData.items length:', layout.layoutData?.items?.length);
        console.log('- layout.layoutData items sample:', layout.layoutData?.items?.[0]);
      }
      
      if (!layout) {
        setError('Layout not found');
        setLoading(false);
        return;
      }

      console.log('Setting layout data:', layout);
      setLayoutData(layout);
      setLoading(false);
    } catch (error) {
      console.error('Error loading layout:', error);
      setError('Failed to load layout');
      setLoading(false);
    }
  }, [params.id]);

  // Debug effect to log what's being passed to WarehouseLayoutBuilder
  useEffect(() => {
    if (layoutData) {
      console.log('Passing to WarehouseLayoutBuilder:', {
        initialOrgUnit: layoutData?.orgUnit,
        initialLayout: {
          items: layoutData?.layoutData?.items || layoutData?.items || [],
          name: layoutData?.name || '',
          itemsLength: layoutData?.layoutData?.items?.length || layoutData?.items?.length || 0
        }
      });
    }
  }, [layoutData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Layout for Editing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Layout</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard/warehouse-management/warehouse-map')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Back to Warehouse Maps
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with layout info */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Layout</h1>
            <p className="text-gray-600 mt-1">
              {layoutData?.name || 'Unknown Layout'} • {layoutData?.orgUnit?.name || 'Unknown Unit'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/warehouse-management/warehouse-map')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Back to Maps
          </button>
        </div>
      </div>

      {/* Layout Builder with pre-loaded data */}
      <WarehouseLayoutBuilder 
        initialOrgUnit={{
          id: layoutData?.orgUnit?.id || 'production-unit-1',
          name: layoutData?.orgUnit || 'Production Unit 1',
          location: layoutData?.location || 'Unknown'
        }}
        initialLayout={{
          items: layoutData?.layoutData?.items || layoutData?.items || [],
          name: layoutData?.name || ''
        }}
      />
    </div>
  );
}
