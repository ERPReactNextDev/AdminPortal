"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { toast } from "sonner"

interface AuditProps<T> {
  customers: T[]
  setAuditedAction: React.Dispatch<React.SetStateAction<T[]>>
  setDuplicateIdsAction: React.Dispatch<React.SetStateAction<Set<number>>>
  setIsAuditViewAction: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * 🔍 Audit component (reusable + no duplicate interface)
 */
export function Audit<T extends { id: number; companyname?: string; contactnumber?: string; contactperson?: string; typeclient?: string; status?: string }>({
  customers,
  setAuditedAction,
  setDuplicateIdsAction,
  setIsAuditViewAction,
}: AuditProps<T>) {
  const handleAudit = () => {
    const seen = new Map<string, number>()
    const duplicates = new Set<number>()

    customers.forEach((c) => {
      const key = `${c.companyname?.trim().toLowerCase()}|${c.contactnumber?.trim()}|${c.contactperson
        ?.trim()
        .toLowerCase()}`
      if (seen.has(key)) {
        duplicates.add(seen.get(key)!)
        duplicates.add(c.id)
      } else {
        seen.set(key, c.id)
      }
    })

    const issues = customers.filter(
      (c) => !c.typeclient?.trim() || !c.status?.trim() || duplicates.has(c.id)
    )

    toast.loading("Auditing database...")
    setTimeout(() => {
      toast.success("Audit completed successfully!")
    }, 800)


    setAuditedAction(issues)
    setDuplicateIdsAction(duplicates)
    setIsAuditViewAction(true)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleAudit}>
      <ShieldAlert className="size-4 mr-1" /> Audit Database
    </Button>
  )
}
