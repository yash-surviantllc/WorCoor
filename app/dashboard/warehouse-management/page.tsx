'use client';

import Link from 'next/link';
import { Map, LayoutDashboard, Warehouse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageTitle } from '@/components/page-title';

export default function WarehouseManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Warehouse Management"
        description="Manage your warehouse layouts and operational maps"
        icon={Warehouse}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Warehouse Map Card */}
        <Link href="/dashboard/warehouse-management/warehouse-map">
          <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-50">Warehouse Map</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200">
                    View and manage operational warehouse layouts. Access live warehouse maps, 
                    search locations, track inventory, and monitor warehouse operations in real-time.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium">
                    Open Warehouse Map
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Layout Builder Card */}
        <Link href="/dashboard/warehouse-management/layout-builder">
          <Card className="group relative overflow-hidden border border-slate-200 bg-white/80 backdrop-blur-sm shadow-soft hover:shadow-medium transition-all duration-300 h-full cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-50">Layout Builder</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-200">
                    Design and create warehouse layouts. Use drag-and-drop tools to build storage zones, 
                    add racks, define boundaries, and create professional warehouse floor plans.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-primary font-medium">
                    Open Layout Builder
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-100">Total Layouts</p>
                <p className="text-3xl font-bold text-white">
                  {typeof window !== 'undefined' && localStorage.getItem('warehouseLayouts') 
                    ? JSON.parse(localStorage.getItem('warehouseLayouts') || '[]').length 
                    : 1}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-100">Active Warehouses</p>
                <p className="text-3xl font-bold text-white">
                  {typeof window !== 'undefined' && localStorage.getItem('warehouseLayouts')
                    ? JSON.parse(localStorage.getItem('warehouseLayouts') || '[]').filter((l: any) => l.operationalStatus === 'operational').length
                    : 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <CardContent className="p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-100">Storage Capacity</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Map className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
