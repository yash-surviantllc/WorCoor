"use client"

import { useRef, useEffect } from "react"
import { Edit, Trash, Copy, Clock, CheckCircle, User } from "lucide-react"

interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  itemId: string
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onAssign?: () => void
  onUpdateProgress?: () => void
  onComplete?: () => void
  itemType: "task" | "order" | "assignment"
  itemStatus?: string
}

export function ContextMenu({
  x,
  y,
  visible,
  itemId,
  onClose,
  onEdit,
  onDelete,
  onCopy,
  onAssign,
  onUpdateProgress,
  onComplete,
  itemType,
  itemStatus = "",
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 min-w-[160px] bg-white rounded-md shadow-md border border-gray-200"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <div className="py-1">
        {onEdit && (
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            Edit {itemType === "task" ? "Task" : itemType === "order" ? "Order" : "Assignment"}
          </button>
        )}

        {onCopy && (
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" />
            Clone {itemType === "task" ? "Task" : itemType === "order" ? "Order" : "Assignment"}
          </button>
        )}

        {onAssign && itemStatus !== "Completed" && (
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={onAssign}
          >
            <User className="h-4 w-4" />
            Assign Worker
          </button>
        )}

        {onUpdateProgress && itemStatus === "In Progress" && (
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={onUpdateProgress}
          >
            <Clock className="h-4 w-4" />
            Update Progress
          </button>
        )}

        {onComplete && itemStatus !== "Completed" && (
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            onClick={onComplete}
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Completed
          </button>
        )}

        {onDelete && (
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
            Delete {itemType === "task" ? "Task" : itemType === "order" ? "Order" : "Assignment"}
          </button>
        )}
      </div>
    </div>
  )
}
