"use client"

import React, { useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppCommandModal } from "./app-command-modal"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconGripVertical } from "@tabler/icons-react"

interface AppCardProps {
  id: number
  title: string
  description: string
  image?: string
}

export const AppCard: React.FC<AppCardProps> = ({ id, title, description, image }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  // 🧠 Convert transform to inline style
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
  }

  // 💾 Save drag info to localStorage while dragging
  useEffect(() => {
    if (isDragging) {
      const sessionKey = "appCard_drag_state"
      const dragData = {
        id,
        title,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(sessionKey, JSON.stringify(dragData))
    }
  }, [isDragging, id, title])

  // 🧹 Optional: clear on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem("appCard_drag_state")
    }
  }, [])

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden flex flex-col h-full">
        {/* 🔹 Drag handle */}
        <div
          className="flex items-center justify-between p-2 select-none"
          {...attributes}
          {...listeners}
        >
          <button className="text-muted-foreground hover:text-foreground">
            <IconGripVertical className="size-4" />
          </button>
        </div>

        {/* 🔹 Image */}
        {image && (
          <div className="w-full h-40 sm:h-48 lg:h-40 overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* 🔹 Content */}
        <CardContent className="px-4 pb-4 flex-1">
          <CardTitle className="text-md font-semibold line-clamp-2">{title}</CardTitle>
          <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
        </CardContent>

        {/* 🔹 Footer */}
        <div className="px-4 pb-4">
          <AppCommandModal
            appName={title.split(" -")[0]}
            trigger={
              <Button size="sm" variant="outline" className="w-full">
                Open
              </Button>
            }
          />
        </div>
      </Card>
    </div>
  )
}
