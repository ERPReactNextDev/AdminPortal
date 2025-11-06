"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "../../components/app-sidebar"
import { AppCard } from "../../components/app-card"
import { AppTable } from "../../components/app-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

// 🧩 drag imports
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

interface Item {
  id: number
  title: string
  description: string
  image?: string
}

export default function AccountPage() {
  const searchParams = useSearchParams()
  const queryUserId = searchParams?.get("userId")
  const [userId] = useState<string | null>(queryUserId ?? null)
  const router = useRouter()

  // 🔹 Data setup
  const titles = [
    "Taskflow - Activity Time and Motion Management System",
    "Ecodesk - Customer Ticketing System",
    "Acculog - Attendance Tracking System",
    "Shifts - Room Reservation System",
    "Linker X - Store and Shared Links Platform",
    "Stash - IT Asset Management System",
    "IT Ticketing Management System",
    "Know My Employee",
    "WooCommerce",
    "Shopify",
    "Cloudinary",
  ]

  const generateDescription = (title: string) => {
    if (title.includes("Taskflow")) return "Manage and track activity time and motion efficiently."
    if (title.includes("Ecodesk")) return "Customer support ticketing system for seamless issue tracking."
    if (title.includes("Acculog")) return "Attendance tracking system to monitor employee hours."
    if (title.includes("Shifts")) return "Reserve rooms and manage shift schedules easily."
    if (title.includes("Linker X")) return "Platform to store and share links securely."
    if (title.includes("Stash")) return "IT asset management system to track company equipment."
    if (title.includes("IT Ticketing")) return "IT support ticketing and workflow management."
    if (title.includes("Know My Employee")) return "Employee analytics and HR insights platform."
    if (title.includes("Cloudinary")) return "Media management and image hosting solution."
    if (title.includes("WooCommerce")) return "E-commerce platform for WordPress stores."
    if (title.includes("Shopify")) return "Complete e-commerce solution for online stores."
    return "Description for " + title
  }

  const getImageForTitle = (title: string) => {
    if (title.includes("Taskflow")) return "/images/logo/1.jpg"
    if (title.includes("Ecodesk")) return "/images/logo/2.jpg"
    if (title.includes("Acculog")) return "/images/logo/3.jpg"
    if (title.includes("WooCommerce")) return "/images/logo/4.jpg"
    if (title.includes("Shopify")) return "/images/logo/5.jpg"
    if (title.includes("Cloudinary")) return "/images/logo/6.jpg"
    if (title.includes("Shifts")) return "/images/logo/9.png"
    if (title.includes("Linker X")) return "/images/logo/10.png"
    if (title.includes("Stash")) return "/images/logo/11.png"
    if (title.includes("Know My Employee")) return "/ecoshift.png"
    if (title.includes("IT Ticketing")) return "/ecoshift.png"
    return "/logo/default.jpg"
  }

  const items: Item[] = titles.map((title, i) => ({
    id: i + 1,
    title,
    description: generateDescription(title),
    image: getImageForTitle(title),
  }))

  // 🧭 Pagination setup
  const cardsPerPage = 9
  const tablePerPage = 10

  const [cardPage, setCardPage] = useState(1)
  const [tablePage, setTablePage] = useState(1)
  const [tabValue, setTabValue] = useState<"cards" | "table">("cards")

  const totalCardPages = Math.ceil(items.length / cardsPerPage)
  const totalTablePages = Math.ceil(items.length / tablePerPage)

  const paginatedCards = items.slice((cardPage - 1) * cardsPerPage, cardPage * cardsPerPage)
  const paginatedTable = items.slice((tablePage - 1) * tablePerPage, tablePage * tablePerPage)

  const generatePages = (total: number) => Array.from({ length: total }, (_, i) => i + 1)

  // 🪄 DRAG logic for cards
  const [cardData, setCardData] = useState(paginatedCards)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = cardData.findIndex((c) => c.id === active.id)
      const newIndex = cardData.findIndex((c) => c.id === over.id)
      setCardData(arrayMove(cardData, oldIndex, newIndex))
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar userId={userId} />
      <SidebarInset>
        {/* 🔹 Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              Back
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Applications</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Modules</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="ml-auto">
            <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as "cards" | "table")}>
              <TabsList className="space-x-2">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* 🔹 Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as "cards" | "table")} className="w-full">
            
            {/* 🟩 CARDS TAB */}
            <TabsContent value="cards">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleCardDragEnd}
                sensors={sensors}
              >
                <SortableContext items={cardData.map((c) => c.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cardData.map((item) => (
                      <AppCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        image={item.image}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Pagination */}
              <Pagination className="mt-4 justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => cardPage > 1 && setCardPage(cardPage - 1)}
                      className={cardPage === 1 ? "pointer-events-none opacity-50" : ""}
                    >
                      Prev
                    </PaginationLink>
                  </PaginationItem>
                  {generatePages(totalCardPages).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCardPage(page)} isActive={page === cardPage}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => cardPage < totalCardPages && setCardPage(cardPage + 1)}
                      className={cardPage === totalCardPages ? "pointer-events-none opacity-50" : ""}
                    >
                      Next
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TabsContent>

            {/* 🟦 TABLE TAB */}
            <TabsContent value="table">
              <AppTable items={paginatedTable} />
              <Pagination className="mt-4 justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => tablePage > 1 && setTablePage(tablePage - 1)}
                      className={tablePage === 1 ? "pointer-events-none opacity-50" : ""}
                    >
                      Prev
                    </PaginationLink>
                  </PaginationItem>
                  {generatePages(totalTablePages).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setTablePage(page)} isActive={page === tablePage}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => tablePage < totalTablePages && setTablePage(tablePage + 1)}
                      className={tablePage === totalTablePages ? "pointer-events-none opacity-50" : ""}
                    >
                      Next
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TabsContent>

          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
