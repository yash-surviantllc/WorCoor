"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  skuId: string;
  historyType: "procurement" | "blocked" | "wastage" | "dispatched" | "location";
}

export default function HistoryModal({
  isOpen,
  onClose,
  skuId,
  historyType
}: HistoryModalProps) {
  // Mock data for demonstration
  const mockHistory = [
    {
      id: "1",
      date: "2024-01-15",
      action: `SKU ${historyType} recorded`,
      quantity: 50,
      notes: `Quality check completed for ${historyType} operation`,
      user: "System"
    },
    {
      id: "2",
      date: "2024-01-14",
      action: `${historyType} adjustment`,
      quantity: 25,
      notes: "Inventory reconciliation",
      user: "Admin"
    },
    {
      id: "3",
      date: "2024-01-13",
      action: `Bulk ${historyType} update`,
      quantity: 100,
      notes: "Warehouse transfer",
      user: "Warehouse Manager"
    }
  ];

  const getHistoryTypeLabel = (type: string) => {
    switch (type) {
      case "procurement": return "Procurement";
      case "blocked": return "Blocked";
      case "wastage": return "Wastage";
      case "dispatched": return "Dispatched";
      case "location": return "Location";
      default: return "History";
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case "procurement": return "bg-green-100 text-green-800";
      case "blocked": return "bg-red-100 text-red-800";
      case "wastage": return "bg-orange-100 text-orange-800";
      case "dispatched": return "bg-blue-100 text-blue-800";
      case "location": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            SKU {getHistoryTypeLabel(historyType)} History
            <Badge className={getHistoryTypeColor(historyType)}>
              {historyType}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View the complete {historyType} history for SKU {skuId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{item.action}</div>
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="ml-2 font-medium">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <span className="ml-2">{item.user}</span>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Notes:</span> {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
