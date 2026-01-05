/**
 * Custom Hook for WorCoor Integration
 * Provides state management and utilities for integration
 */

import { useState, useEffect, useCallback } from 'react';

const useWorCoorIntegration = () => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load layouts from localStorage
  const loadLayouts = useCallback(() => {
    try {
      const savedLayouts = localStorage.getItem('warehouseLayouts');
      if (savedLayouts) {
        setLayouts(JSON.parse(savedLayouts));
      }
    } catch (error) {
      console.error('Error loading layouts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save layout
  const saveLayout = useCallback((layoutData) => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('warehouseLayouts') || '[]');
      savedLayouts.push(layoutData);
      localStorage.setItem('warehouseLayouts', JSON.stringify(savedLayouts));
      setLayouts(savedLayouts);
      return true;
    } catch (error) {
      console.error('Error saving layout:', error);
      return false;
    }
  }, []);

  // Delete layout
  const deleteLayout = useCallback((layoutId) => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('warehouseLayouts') || '[]');
      const filtered = savedLayouts.filter(layout => layout.id !== layoutId);
      localStorage.setItem('warehouseLayouts', JSON.stringify(filtered));
      setLayouts(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting layout:', error);
      return false;
    }
  }, []);

  // Update layout
  const updateLayout = useCallback((layoutId, updates) => {
    try {
      const savedLayouts = JSON.parse(localStorage.getItem('warehouseLayouts') || '[]');
      const updated = savedLayouts.map(layout => 
        layout.id === layoutId ? { ...layout, ...updates } : layout
      );
      localStorage.setItem('warehouseLayouts', JSON.stringify(updated));
      setLayouts(updated);
      return true;
    } catch (error) {
      console.error('Error updating layout:', error);
      return false;
    }
  }, []);

  // Get layout by ID
  const getLayout = useCallback((layoutId) => {
    return layouts.find(layout => layout.id === layoutId);
  }, [layouts]);

  // Clear all layouts
  const clearAllLayouts = useCallback(() => {
    try {
      localStorage.removeItem('warehouseLayouts');
      setLayouts([]);
      return true;
    } catch (error) {
      console.error('Error clearing layouts:', error);
      return false;
    }
  }, []);

  // Listen for layout saved events
  useEffect(() => {
    const handleLayoutSaved = () => {
      loadLayouts();
    };

    window.addEventListener('layoutSaved', handleLayoutSaved);
    return () => window.removeEventListener('layoutSaved', handleLayoutSaved);
  }, [loadLayouts]);

  // Initial load
  useEffect(() => {
    loadLayouts();
  }, [loadLayouts]);

  return {
    layouts,
    loading,
    saveLayout,
    deleteLayout,
    updateLayout,
    getLayout,
    clearAllLayouts,
    refreshLayouts: loadLayouts,
  };
};

export default useWorCoorIntegration;
