'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import SavedLayoutRenderer from '@/components/warehouse/SavedLayoutRenderer';

export const dynamic = 'force-dynamic';

export default function FullscreenPage() {
  const searchParams = useSearchParams();
  const [layout, setLayout] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
    };
  }, []);

  const loadLayout = (unitId: string | null) => {
    const storedLayouts = JSON.parse(
      localStorage.getItem("warehouseLayouts") || "[]"
    );
    const foundLayout = storedLayouts.find((l: any) => l.id === unitId);
    console.log('🔥 Fullscreen:', { unitId, found: foundLayout?.name });
    setLayout(foundLayout);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    const unitId = searchParams.get("unit");
    loadLayout(unitId);
  }, [searchParams]);

  // Auto-refresh logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        const unitId = searchParams.get("unit");
        loadLayout(unitId);
      }, refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshInterval, searchParams]);

  if (!layout) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        background: "#0b1220", color: "white",
        display: "flex", justifyContent: "center", alignItems: "center",
        fontSize: "24px"
      }}>
        Loading Layout...
      </div>
    );
  }

  const items = layout.layoutData?.items || layout.items || [];

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
        height: '56px',
        background: '#1a2332',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid #2a3441',
        flexShrink: 0,
        gap: '12px'
      }}>
        {/* Left: Layout name + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>
            {layout.name}
          </span>
          <span style={{
            background: '#f59e0b', color: '#000',
            fontSize: '11px', fontWeight: 600,
            padding: '2px 8px', borderRadius: '4px'
          }}>
            {layout.status || 'draft'}
          </span>
        </div>

        {/* Center: Search + Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '700px' }}>
          <input
            type="text"
            placeholder="Search items..."
            style={{
              background: '#0b1220', border: '1px solid #2a3441',
              color: 'white', padding: '6px 12px', borderRadius: '6px',
              fontSize: '13px', width: '180px', outline: 'none'
            }}
          />
          {['All Locations', 'All SKU', 'All Assets'].map((label) => (
            <select key={label} style={{
              background: '#0b1220', border: '1px solid #2a3441',
              color: 'white', padding: '6px 10px', borderRadius: '6px',
              fontSize: '13px', cursor: 'pointer', outline: 'none'
            }}>
              <option>{label}</option>
            </select>
          ))}

          {/* Refresh dropdown with actual intervals */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{
              background: '#0b1220', border: '1px solid #2a3441',
              color: refreshInterval > 0 ? '#10b981' : 'white',
              padding: '6px 10px', borderRadius: '6px',
              fontSize: '13px', cursor: 'pointer', outline: 'none',
              fontWeight: refreshInterval > 0 ? 600 : 400
            }}
          >
            <option value={0}>Refresh: Off</option>
            <option value={1}>Refresh: 1s</option>
            <option value={5}>Refresh: 5s</option>
            <option value={10}>Refresh: 10s</option>
          </select>
        </div>

        {/* Right: last refreshed + fullscreen + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {refreshInterval > 0 && (
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>
              {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            style={{
              background: 'transparent', color: 'white',
              border: '1px solid #2a3441', padding: '6px 10px',
              cursor: 'pointer', borderRadius: '6px', fontSize: '16px'
            }}
            title="Browser Fullscreen"
          >
            ⛶
          </button>
          <button
            onClick={() => window.close()}
            style={{
              background: '#dc2626', color: 'white',
              border: 'none', padding: '6px 14px',
              cursor: 'pointer', borderRadius: '6px', fontSize: '13px',
              fontWeight: 500
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* MAP - fills all available space */}
        <div style={{ flex: 1, background: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex' }}>
          <SavedLayoutRenderer
            items={items}
            width="100%"
            height="100%"
            allowUpscale={true}
            fitMode="contain"
            padding={0}
            onItemClick={(item: any) => console.log('Item clicked:', item)}
          />
        </div>

        {/* RIGHT LEGEND SIDEBAR */}
        <div style={{
          width: '240px',
          background: '#1a2332',
          borderLeft: '1px solid #2a3441',
          padding: '20px',
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>
            Legend
          </h3>
          {[
            { color: '#3b82f6', label: 'Storage Unit' },
            { color: '#10b981', label: 'Receiving Area' },
            { color: '#f59e0b', label: 'Dispatch Area' },
            { color: '#ef4444', label: 'Restricted Area' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: color, borderRadius: '3px', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
