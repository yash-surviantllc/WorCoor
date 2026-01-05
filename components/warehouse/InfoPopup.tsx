'use client';

import React, { useEffect, useRef } from 'react';
import { OCCUPANCY_STATUS, STATUS_COLORS, COMPONENT_TYPES } from '@/lib/warehouse/constants/warehouseComponents';
import { getZoneDescription } from '@/lib/warehouse/utils/locationUtils';

// Structural elements that don't have inventory data
const STRUCTURAL_ELEMENTS = [
  COMPONENT_TYPES.ZONE_DIVIDER,
  COMPONENT_TYPES.AREA_BOUNDARY,
  COMPONENT_TYPES.DOOR,
  COMPONENT_TYPES.GATE,
  COMPONENT_TYPES.EMERGENCY_EXIT,
  COMPONENT_TYPES.ENTRANCE
];

const InfoPopup = ({ item, x, y, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!item) return null;

  const popupStyle = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 400),
    left: Math.min(x, window.innerWidth - 350),
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: 2000,
    width: '320px',
    maxHeight: '400px',
    overflow: 'auto'
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${item.color || '#667eea'} 0%, ${item.color || '#764ba2'} 100%)`,
    color: 'white',
    padding: '1rem',
    borderRadius: '8px 8px 0 0',
    position: 'relative'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case OCCUPANCY_STATUS.EMPTY: return '✅';
      case OCCUPANCY_STATUS.PARTIAL: return '⚠️';
      case OCCUPANCY_STATUS.FULL: return '🔴';
      case OCCUPANCY_STATUS.MAINTENANCE: return '🔧';
      case OCCUPANCY_STATUS.RESERVED: return '🔒';
      default: return '❓';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 0.3) return '#4CAF50';
    if (utilization < 0.7) return '#FF9800';
    return '#F44336';
  };

  return (
    <div ref={popupRef} style={popupStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {item.name}
        </div>
        {item.locationCode && (
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            📍 {item.locationCode} - {getZoneDescription(item.locationCode?.charAt(0))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {STRUCTURAL_ELEMENTS.includes(item.type) ? (
          /* Structural Element Information */
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
                🏗️ Structural Element
              </h4>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '0.5rem', 
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                <div><strong>Type:</strong> {item.type.replace(/_/g, ' ').toUpperCase()}</div>
                <div><strong>Size:</strong> {item.width} × {item.height}</div>
                <div><strong>Position:</strong> ({item.x}, {item.y})</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
                🔗 Linking Capabilities
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                This element can automatically connect with other structural elements when placed nearby.
              </div>
            </div>
          </div>
        ) : (
          /* Regular Element Information */
          <div>
            {/* Status Section */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
                📊 Current Status
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(item.occupancyStatus)}</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: STATUS_COLORS[item.occupancyStatus] || '#666'
                }}>
                  {item.occupancyStatus?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
          
          {item.inventoryData && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '0.5rem', 
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Utilization:</span>
                <span style={{ 
                  fontWeight: 'bold',
                  color: getUtilizationColor(item.inventoryData.utilization)
                }}>
                  {Math.round(item.inventoryData.utilization * 100)}%
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: '#e0e0e0', 
                borderRadius: '2px',
                marginTop: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${item.inventoryData.utilization * 100}%`,
                  height: '100%',
                  background: getUtilizationColor(item.inventoryData.utilization),
                  borderRadius: '2px'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        {item.inventoryData && item.inventoryData.inventory && item.inventoryData.inventory.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
              📦 Current Inventory ({item.inventoryData.inventory.length} SKUs)
            </h4>
            <div style={{ maxHeight: '120px', overflow: 'auto' }}>
              {item.inventoryData.inventory.map((inv, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.25rem 0',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ fontWeight: '500' }}>{inv.sku}</span>
                  <span style={{ color: '#666' }}>
                    Qty: {inv.quantity} {inv.reserved > 0 && `(${inv.reserved} reserved)`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environmental Conditions */}
        {(item.inventoryData?.temperature || item.inventoryData?.humidity) && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
              🌡️ Environmental Conditions
            </h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
              {item.inventoryData.temperature && (
                <div>
                  <span style={{ color: '#666' }}>Temperature:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '0.25rem' }}>
                    {item.inventoryData.temperature}°C
                  </span>
                </div>
              )}
              {item.inventoryData.humidity && (
                <div>
                  <span style={{ color: '#666' }}>Humidity:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '0.25rem' }}>
                    {item.inventoryData.humidity}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

            {/* Stack Information */}
            {item.stack && item.stack.layers && item.stack.layers.length > 1 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>
                  📚 Stack Information
                </h4>
                <div style={{ fontSize: '0.8rem' }}>
                  <div>Layers: {item.stack.layers.length}</div>
              <div>Total SKUs: {item.stack.layers.reduce((total, layer) => 
                total + (layer.skus ? layer.skus.length : 0), 0
              )}</div>
            </div>
          </div>
        )}

            {/* Technical Details */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '0.5rem', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              <div><strong>Type:</strong> {item.type}</div>
              <div><strong>Size:</strong> {item.width} × {item.height}</div>
              <div><strong>Position:</strong> ({item.x}, {item.y})</div>
              {item.inventoryData?.lastActivity && (
                <div><strong>Last Activity:</strong> {new Date(item.inventoryData.lastActivity).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPopup;

