'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WarehouseLayoutBuilder from '@/components/warehouse/WarehouseLayoutBuilder';
import LocationDetailsPanel from '@/components/warehouse/LocationDetailsPanel';
import SavedLayoutRenderer, { getLayoutItemKey } from '@/components/warehouse/SavedLayoutRenderer';
import summarizeStorageComponents from '@/lib/warehouse/utils/layoutComponentSummary';
import layoutComponentsMock from '@/lib/warehouse/data/layoutComponentsMock.json';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Settings, RefreshCw, X, Maximize2, Minimize2, ChevronDown, Filter } from 'lucide-react';
import WarehouseItem from './WarehouseItem';
import { WarehouseItem as WarehouseItemType } from '@/types/warehouse';

interface WarehouseMapViewProps {
  facilityData?: any;
  initialSelectedLayoutId?: string;
  onModalClose?: () => void;
  fullscreenMode?: boolean;
}

const WarehouseMapView: React.FC<WarehouseMapViewProps> = ({ facilityData, initialSelectedLayoutId, onModalClose }) => {
  // Check for fullscreen mode from URL parameters
  const searchParams = useSearchParams();
  const isFullscreenMode = searchParams.get('fullscreen') === 'true' || searchParams.get('view') === 'fullscreen';
  const fullscreenUnitId = searchParams.get('unit');
  
  // 🔥 DEBUG - Add these logs
  console.log("fullscreen param:", searchParams.get('fullscreen'));
  console.log("view param:", searchParams.get('view'));
  console.log("unit param:", searchParams.get('unit'));
  console.log("isFullscreenMode:", isFullscreenMode);
  console.log("fullscreenUnitId:", fullscreenUnitId);
  
  // 🔥 FULLSCREEN CHECK MUST BE THE VERY FIRST THING - Before any state initialization
  if (isFullscreenMode) {
    console.log("🔥 FULLSCREEN MODE TRIGGERED - Rendering fullscreen layout");
    
    // We need to get savedLayouts, but they're in state. For now, use localStorage directly
    let savedLayouts = [];
    try {
      const layouts = localStorage.getItem('warehouseLayouts');
      if (layouts) {
        savedLayouts = JSON.parse(layouts);
      }
    } catch (error) {
      console.error('Error loading layouts from localStorage:', error);
    }
    
    const savedLayout = savedLayouts.find((layout: any) => layout.id === fullscreenUnitId);
    console.log('🗺️ Found saved layout:', savedLayout ? { id: savedLayout.id, name: savedLayout.name, hasItems: !!savedLayout.items, itemCount: savedLayout.items?.length } : 'NOT FOUND');
    
    if (!savedLayout) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'white',
          fontSize: '24px',
          flexDirection: 'column',
          gap: '20px',
          background: '#0b1220'
        }}>
          <div>Layout not found</div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>
            Looking for: {fullscreenUnitId}
          </div>
        </div>
      );
    }

    if (!savedLayout.items || savedLayout.items.length === 0) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'white',
          fontSize: '24px',
          flexDirection: 'column',
          gap: '20px',
          background: '#0b1220'
        }}>
          <div>No layout items available</div>
          <div style={{ fontSize: '16px', opacity: 0.7 }}>
            Layout: {savedLayout.name}
          </div>
        </div>
      );
    }

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#0b1220',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* HEADER */}
        <div style={{
          height: '64px',
          background: '#1a2332',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #2a3441',
          flexShrink: 0
        }}>
          <div style={{ color: 'white', fontWeight: 600 }}>
            {savedLayout?.name}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                const layoutId = fullscreenUnitId;
                const fullscreenUrl = `/warehouse-live-fullscreen?unit=${layoutId}`;
                window.open(fullscreenUrl, "_blank");
              }}
              style={{
                background: '#0b1220',
                color: 'white',
                border: '1px solid #2a3441',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              ⛶
            </button>
            
            <button
              onClick={() => window.close()}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden'
        }}>
          
          {/* MAP */}
          <div style={{
            flex: 1,
            background: '#ffffff',
            position: 'relative'
          }}>
            <SavedLayoutRenderer
              items={savedLayout.items}
              width={typeof window !== 'undefined' ? window.innerWidth - 280 : 1200}
              height={typeof window !== 'undefined' ? window.innerHeight - 64 : 800}
              onItemClick={(item: any, index: number) => console.log('🗺️ Item selected:', item)}
            />
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{
            width: '280px',
            background: '#1a2332',
            borderLeft: '1px solid #2a3441',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              color: 'white', 
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Legend
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px'
                }}></div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Storage Unit</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#10b981',
                  borderRadius: '4px'
                }}></div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Receiving Area</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '4px'
                }}></div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Dispatch Area</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#ef4444',
                  borderRadius: '4px'
                }}></div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Restricted Area</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const selectedUnitForDemo = fullscreenUnitId || initialSelectedLayoutId || null;
  const [setSelectedUnitForDemoState, setSelectedUnitForDemo] = useState<string | null>(selectedUnitForDemo);
  const [showDemoMapModal, setShowDemoMapModal] = useState<boolean>(
    isFullscreenMode ? true : !!initialSelectedLayoutId
  );
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [cameFromDashboard, setCameFromDashboard] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'layout-builder'>('dashboard');
  const layoutId = searchParams.get('layoutId');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocationTag, setSelectedLocationTag] = useState<string>('');
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Additional state for live view
  const [selectedItem, setSelectedItem] = useState<WarehouseItemType | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState<boolean>(false);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load saved layouts from localStorage
  const refreshSavedLayouts = useCallback(() => {
    console.log('🔄 refreshSavedLayouts called');
    try {
      const layouts = localStorage.getItem('warehouseLayouts');
      if (layouts) {
        const parsedLayouts = JSON.parse(layouts);
        console.log('🔄 Loaded layouts from localStorage:', parsedLayouts);
        setSavedLayouts(parsedLayouts);
      } else {
        console.warn('🔄 Refresh skipped: no warehouseLayouts in localStorage');
        setSavedLayouts([]);
      }
    } catch (error) {
      console.error('🔄 Error loading layouts from localStorage:', error);
      setSavedLayouts([]);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    refreshSavedLayouts();
    // Reset transition state when layoutId changes
    setIsTransitioning(false);

    // Check if user came from main dashboard (has layoutId in URL)
    if (layoutId) {
      setCameFromDashboard(true);
      setSelectedUnitForDemo(layoutId);
      setShowDemoMapModal(true);
    }

    if (fullscreenMode && initialSelectedLayoutId) {
      setSelectedUnitForDemo(initialSelectedLayoutId);
    }
  }, [layoutId, fullscreenMode, initialSelectedLayoutId, refreshSavedLayouts]);

  // Handle initialSelectedLayoutId for modal mode
  useEffect(() => {
    console.log('🎯 initialSelectedLayoutId effect:', { 
      initialSelectedLayoutId, 
      savedLayouts: savedLayouts.length,
      mounted,
      showDemoMapModal 
    });
    
    if (initialSelectedLayoutId && savedLayouts.length > 0 && mounted) {
      console.log('🎯 Setting up modal for initialSelectedLayoutId:', initialSelectedLayoutId);
      console.log('🎯 Available layouts:', savedLayouts.map(l => ({ id: l.id, name: l.name })));
      
      const targetLayout = savedLayouts.find(l => l.id === initialSelectedLayoutId);
      console.log('🎯 Target layout found:', targetLayout ? {
        id: targetLayout.id,
        name: targetLayout.name,
        hasLayoutData: !!targetLayout.layoutData,
        hasItems: !!targetLayout.items,
        layoutDataItems: targetLayout.layoutData?.items?.length,
        itemsLength: Array.isArray(targetLayout.items) ? targetLayout.items.length : 'N/A'
      } : 'NOT FOUND');
      
      setSelectedUnitForDemo(initialSelectedLayoutId);
      
      // Small delay to ensure data is processed
      setTimeout(() => {
        setShowDemoMapModal(true);
        console.log('🎯 Modal should now be visible');
      }, 100);
    }
  }, [initialSelectedLayoutId, savedLayouts, mounted]);

  // Process saved layouts into warehouse units
  const customLayoutUnits = useMemo(() => {
    if (!savedLayouts || savedLayouts.length === 0) {
      console.log('🔍 No saved layouts to process');
      return [];
    }

    console.log('🔍 Processing saved layouts into units:', savedLayouts.length);
    
    return savedLayouts.map((layout: any) => {
      console.log('🔍 Processing layout:', layout.name, layout.id);
      console.log('🔍 Layout structure:', {
        hasLayoutData: !!layout.layoutData,
        layoutDataItems: layout.layoutData?.items?.length,
        hasItems: !!layout.items,
        items: Array.isArray(layout.items) ? layout.items.length : 'N/A',
        itemsType: typeof layout.items
      });

      // Ensure layoutData exists and has items
      let layoutData = layout.layoutData || {};
      
      if (layoutData.items && Array.isArray(layoutData.items)) {
        console.log('🔧 Enhancing existing layoutData.items for layout:', layout.name);
        // Enhance existing items with missing properties
        layoutData.items = layoutData.items.map((item: any, index: number) => {
          console.log('🔧 Enhanced existing item', index, ':', {
            original: { 
              x: item.x, 
              y: item.y, 
              width: item.width, 
              height: item.height,
              id: item.id,
              name: item.name,
              type: item.type
            },
            enhanced: {
              x: item.x ?? (index * 50) + 10,
              y: item.y ?? (index * 30) + 10,
              width: item.width ?? 60,
              height: item.height ?? 40,
              id: item.id ?? `item-${index}`,
              name: item.name ?? `Item ${index + 1}`,
              type: item.type ?? 'storage_unit'
            }
          });
          
          return {
            ...item,
            x: item.x ?? (index * 50) + 10,
            y: item.y ?? (index * 30) + 10,
            width: item.width ?? 60,
            height: item.height ?? 40,
            id: item.id ?? `item-${index}`,
            name: item.name ?? `Item ${index + 1}`,
            type: item.type ?? 'storage_unit'
          };
        });
      } else if (layout.items && Array.isArray(layout.items)) {
        console.log('🔧 Creating layoutData.items from layout.items for layout:', layout.name);
        // Create layoutData.items from layout.items
        layoutData.items = layout.items.map((item: any, index: number) => {
          console.log('🔧 Enhanced item from layout.items', index, ':', {
            original: { 
              x: item.x, 
              y: item.y, 
              width: item.width, 
              height: item.height,
              id: item.id,
              name: item.name,
              type: item.type
            },
            enhanced: {
              x: item.x ?? (index * 50) + 10,
              y: item.y ?? (index * 30) + 10,
              width: item.width ?? 60,
              height: item.height ?? 40,
              id: item.id ?? `item-${index}`,
              name: item.name ?? `Item ${index + 1}`,
              type: item.type ?? 'storage_unit'
            }
          });
          
          return {
            ...item,
            x: item.x ?? (index * 50) + 10,
            y: item.y ?? (index * 30) + 10,
            width: item.width ?? 60,
            height: item.height ?? 40,
            id: item.id ?? `item-${index}`,
            name: item.name ?? `Item ${index + 1}`,
            type: item.type ?? 'storage_unit'
          };
        });
      } else {
        console.warn('⚠️ No items found in layout:', layout.name);
        layoutData.items = [];
      }

      return {
        id: layout.id,
        name: layout.name,
        subtitle: `${layout.location || 'Unknown'} - ${layout.size?.width || 0}x${layout.size?.height || 0}`,
        status: layout.status || 'OPERATIONAL',
        statusColor: layout.status === 'OPERATIONAL' ? '#00D4AA' : '#FFA500',
        isCustomLayout: true,
        layoutData: layoutData,
        utilization: layout.utilization || 0,
        lastActivity: layout.lastActivity || 'Unknown',
        orgUnit: { id: layout.id, name: layout.name }
      };
    });
  }, [savedLayouts]);

  // Default warehouse units
  const defaultUnits = [
    {
      id: 'unit-1',
      name: 'Main Warehouse',
      subtitle: 'Building A - 1000x800',
      status: 'OPERATIONAL',
      statusColor: '#00D4AA',
      isCustomLayout: false,
      layoutData: { items: [] },
      utilization: 75,
      lastActivity: '2 hours ago',
      orgUnit: { id: 'unit-1', name: 'Main Warehouse' }
    },
    {
      id: 'unit-2',
      name: 'Storage Facility B',
      subtitle: 'Building B - 800x600',
      status: 'MAINTENANCE',
      statusColor: '#FFA500',
      isCustomLayout: false,
      layoutData: { items: [] },
      utilization: 45,
      lastActivity: '1 day ago',
      orgUnit: { id: 'unit-2', name: 'Storage Facility B' }
    }
  ];

  // Combine all warehouse units
  const warehouseUnits = [...defaultUnits, ...customLayoutUnits];

  // Other handlers
  const handleOpenFullscreenTab = useCallback(() => {
    if (selectedUnitForDemo) {
      const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
      if (unit) {
        const unitName = unit.name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
        const url = `/dashboard/warehouse-management/live/${selectedUnitForDemo}?name=${unitName}`;
        window.open(url, '_blank');
      }
    }
  }, [selectedUnitForDemo, warehouseUnits]);

  const handleCloseModal = useCallback(() => {
    setShowDemoMapModal(false);
    setSelectedUnitForDemo(null);
    if (onModalClose) {
      onModalClose();
    }
  }, [onModalClose]);

  const refreshLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Live data refreshed');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Handle browser back button to close modal
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showDemoMapModal) {
        setShowDemoMapModal(false);
        if (onModalClose) {
          onModalClose();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showDemoMapModal, onModalClose]);

  // 🔥 FULLSCREEN CHECK MUST BE FIRST - Before any other returns
  if (isFullscreenMode) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0b1220',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {(() => {
          console.log('🗺️ Rendering fullscreen layout for unit:', selectedUnitForDemo);
          
          // Find the unit from savedLayouts (not warehouseUnits)
          const savedLayout = savedLayouts.find(layout => layout.id === selectedUnitForDemo);
          console.log('🗺️ Found saved layout:', savedLayout ? { id: savedLayout.id, name: savedLayout.name, hasItems: !!savedLayout.items, itemCount: savedLayout.items?.length } : 'NOT FOUND');
          console.log('🗺️ All saved layouts:', savedLayouts.map(l => ({ id: l.id, name: l.name, hasItems: !!l.items })));
          
          if (!savedLayout) {
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: 'white',
                fontSize: '24px',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>Layout not found</div>
                <div style={{ fontSize: '16px', opacity: 0.7 }}>
                  Looking for: {selectedUnitForDemo}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.5 }}>
                  Available layouts: {savedLayouts.map(l => l.id).join(', ')}
                </div>
              </div>
            );
          }

          if (!savedLayout.items || savedLayout.items.length === 0) {
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                color: 'white',
                fontSize: '24px',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>No layout items available</div>
                <div style={{ fontSize: '16px', opacity: 0.7 }}>
                  Layout: {savedLayout.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.5 }}>
                  Items count: {savedLayout.items?.length || 0}
                </div>
              </div>
            );
          }

          console.log('🗺️ Rendering fullscreen SavedLayoutRenderer with items:', savedLayout.items.length);
          return (
            <div style={{ 
              width: '95vw', 
              height: '95vh', 
              background: '#f5f5f5',
              borderRadius: '8px',
              border: '2px solid #2a3441',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000
              }}>
                {savedLayout.name} - {savedLayout.items.length} items
              </div>
              <div style={{
                width: '100%',
                height: '100%',
                background: '#ffffff',
                position: 'relative',
                overflow: 'auto'
              }}>
                <SavedLayoutRenderer
                  items={savedLayout.items}
                  width={window.innerWidth * 0.95}
                  height={window.innerHeight * 0.95}
                  onItemClick={(item: any, index: number) => console.log('🗺️ Item selected:', item)}
                />
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="warehouse-map-view">
      {showDemoMapModal && selectedUnitForDemo && (
        <div 
          className={`demo-map-modal-overlay ${fullscreenMode ? 'fullscreen-mode' : ''}`}
          onClick={() => {
            if (fullscreenMode) return;
            setShowDemoMapModal(false);
          }}
          style={fullscreenMode ? {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#0b1220',
            zIndex: 99999,
            padding: 0
          } : {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div 
            className="demo-map-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={fullscreenMode ? {
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
              background: '#0b1220'
            } : {
              width: '90%',
              height: '90%',
              maxWidth: '1400px',
              maxHeight: '900px',
              background: '#0b1220',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with controls */}
            <div style={{
              background: '#1a2332',
              padding: '16px 20px',
              borderBottom: '1px solid #2a3441',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ 
                  color: 'white', 
                  margin: 0, 
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {(() => {
                    const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
                    return unit ? unit.name : 'Warehouse Unit';
                  })()}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: (() => {
                      const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
                      return unit ? unit.statusColor : '#666';
                    })()
                  }}></span>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {(() => {
                      const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
                      return unit ? unit.status : 'UNKNOWN';
                    })()}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Search input */}
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    style={{
                      paddingLeft: '36px',
                      paddingRight: '12px',
                      padding: '8px 12px',
                      border: '1px solid #2a3441',
                      borderRadius: '6px',
                      background: '#0b1220',
                      color: 'white',
                      fontSize: '14px',
                      width: '200px'
                    }}
                  />
                </div>
                
                {/* Location dropdown */}
                <select style={{
                  padding: '8px 12px',
                  border: '1px solid #2a3441',
                  borderRadius: '6px',
                  background: '#0b1220',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>All Locations</option>
                </select>
                
                {/* SKU dropdown */}
                <select style={{
                  padding: '8px 12px',
                  border: '1px solid #2a3441',
                  borderRadius: '6px',
                  background: '#0b1220',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>All SKU</option>
                </select>
                
                {/* Assets dropdown */}
                <select style={{
                  padding: '8px 12px',
                  border: '1px solid #2a3441',
                  borderRadius: '6px',
                  background: '#0b1220',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>All Assets</option>
                </select>
                
                {/* Auto Refresh dropdown */}
                <select style={{
                  padding: '8px 12px',
                  border: '1px solid #2a3441',
                  borderRadius: '6px',
                  background: '#0b1220',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option>Refresh: Off</option>
                  <option>Refresh: 1 min</option>
                  <option>Refresh: 5 min</option>
                  <option>Refresh: 10 min</option>
                </select>
                
                {/* Fullscreen button */}
                <button 
                  onClick={() => {
                    const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
                    if (unit) {
                      window.open(
                        `/warehouse-live-fullscreen?unit=${selectedUnitForDemo}`,
                        "_blank"
                      );
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #2a3441',
                    borderRadius: '6px',
                    background: '#0b1220',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ⛶
                </button>
                
                <button 
                  onClick={() => setShowDemoMapModal(false)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dc2626',
                    borderRadius: '6px',
                    background: '#dc2626',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Main content area */}
            <div style={{ 
              display: 'flex', 
              flex: 1, 
              overflow: 'hidden' 
            }}>
              {/* Center warehouse map area */}
              <div style={{ 
                flex: 1, 
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0b1220'
              }}>
                {(() => {
                  console.log('🗺️ Rendering demo map content for unit:', selectedUnitForDemo);
                  const unit = warehouseUnits.find(u => u.id === selectedUnitForDemo);
                  console.log('🗺️ Found unit:', unit ? unit.name : 'NOT FOUND');
                  
                  if (!unit) {
                    console.log('🗺️ Unit not found, showing fallback');
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '400px',
                        color: 'white',
                        fontSize: '18px'
                      }}>
                        Unit not found
                      </div>
                    );
                  }

                  if (!unit.isCustomLayout || !unit.layoutData?.items) {
                    console.log('🗺️ No custom layout data, showing fallback');
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '400px',
                        color: 'white',
                        fontSize: '18px'
                      }}>
                        No layout data available
                      </div>
                    );
                  }

                  console.log('🗺️ Rendering SavedLayoutRenderer with items:', unit.layoutData.items.length);
                  return (
                    <div style={{ 
                      width: '800px', 
                      height: '600px', 
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '2px solid #2a3441',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      position: 'relative'
                    }}>
                      <SavedLayoutRenderer
                        items={unit.layoutData.items}
                        width={800}
                        height={600}
                        onItemClick={(item: any, index: number) => console.log('🗺️ Item selected:', item)}
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Right sidebar with legend */}
              <div style={{
                width: '280px',
                background: '#1a2332',
                borderLeft: '1px solid #2a3441',
                padding: '20px',
                overflowY: 'auto'
              }}>
                <h3 style={{ 
                  color: 'white', 
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Legend
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Storage Unit</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#10b981',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Receiving Area</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#f59e0b',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Dispatch Area</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#ef4444',
                      borderRadius: '4px'
                    }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>Restricted Area</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseMapView;
