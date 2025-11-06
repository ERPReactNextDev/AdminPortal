"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { Pagination } from "../../components/app-pagination";
import { toast } from "sonner";
import { Loader2, Search, Trash2, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ButtonGroup } from "@/components/ui/button-group";

interface Activity {
    id: string;
    ReferenceID: string;
    referenceid: string;
    activitynumber?: string;
    companyname?: string;
    contactperson?: string;
    contactnumber?: string;
    emailaddress?: string;
    address?: string;
    area?: string;
    typeclient?: string;
    projectname?: string;
    projectcategory?: string;
    projecttype?: string;
    source?: string;
    targetquota?: string;
    activityremarks?: string;
    ticketreferencenumber?: string;
    wrapup?: string;
    inquiries?: string;
    csragent?: string;
}

interface UserAccount {
    referenceid: string;
    targetquota: string;
}

export default function ActivityLogsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId] = useState<string | null>(searchParams?.get("userId") ?? null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [accounts, setAccounts] = useState<UserAccount[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isFetching, setIsFetching] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(20);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // ✅ Fetch activities
    const fetchActivities = async () => {
        try {
            setIsFetching(true);
            const response = await fetch("/api/Data/Applications/Taskflow/Activity/Fetch");
            const json = await response.json();
            if (!response.ok || json.success === false)
                throw new Error(json.error || "Failed to fetch activities");
            setActivities(json.data || []);
        } catch (err: any) {
            toast.error(`Error fetching activity logs: ${err.message}`);
        } finally {
            setIsFetching(false);
        }
    };

    // ✅ Fetch user accounts (normalize ReferenceID)
    const fetchAccounts = async () => {
  try {
    const res = await fetch("/api/UserManagement/Fetch");
    const data = await res.json();

    // Normalize client-side too, for safety
    const normalized = (data || []).map((u: any) => ({
      referenceid: (u.ReferenceID || u.referenceid || "").toString().trim().toLowerCase(),
      targetquota: u.targetquota || "",
    }));

    setAccounts(normalized);
  } catch (err) {
    console.error("Error fetching accounts", err);
  }
};


    useEffect(() => {
        fetchActivities();
        fetchAccounts();
    }, []);

    // ✅ Filter and paginate
    const filtered = useMemo(() => {
        return activities
            .filter((a) =>
                Object.values(a)
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            )
            .sort((a, b) => {
                const dateA = a.activitynumber ? new Date(a.activitynumber).getTime() : 0;
                const dateB = b.activitynumber ? new Date(b.activitynumber).getTime() : 0;
                return dateB - dateA;
            });
    }, [activities, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const current = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // ✅ Fix Missing Quota — match by referenceid
    const handleFixMissingQuota = async () => {
  if (selectedIds.size === 0) {
      toast.info("Please select at least one activity to update.");
      return;
  }

  // ✅ Only get selected and missing targetquota
  const selectedMissing = activities.filter((a, index) => {
      const uniqueId = a.referenceid || a.id || a.activitynumber || `row-${index}`;
      return (
          selectedIds.has(uniqueId) &&
          (!a.targetquota || a.targetquota.trim() === "")
      );
  });

  if (selectedMissing.length === 0) {
      toast.info("No selected activities with missing target quota.");
      return;
  }

  const confirmFix = window.confirm(
      `Found ${selectedMissing.length} selected activities without target quota. Replace them using matching user quotas?`
  );
  if (!confirmFix) return;

  let updatedCount = 0;
  const updates: any[] = [];

  // ✅ Match activity.referenceid with normalized account.referenceid
  const updatedActivities = activities.map((a, index) => {
      const uniqueId = a.referenceid || a.id || a.activitynumber || `row-${index}`;
      if (
          selectedIds.has(uniqueId) &&
          (!a.targetquota || a.targetquota.trim() === "")
      ) {
          const actRef = (a.ReferenceID || a.referenceid || "")
              .toString()
              .trim()
              .toLowerCase();

          const match = accounts.find(
              (acc) => acc.referenceid === actRef
          );

          if (match && match.targetquota) {
              updatedCount++;
              updates.push({
                  referenceid: a.referenceid,
                  targetquota: match.targetquota,
              });
              return { ...a, targetquota: match.targetquota };
          }
      }
      return a;
  });

  if (updatedCount > 0) {
      try {
          const res = await fetch(
              "/api/Data/Applications/Taskflow/Activity/UpdateQuotaBatch",
              {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ updates }),
              }
          );

          const result = await res.json();
          if (!res.ok || !result.success)
              throw new Error(result.error || "Failed to update backend");

          setActivities(updatedActivities);
          toast.success(`${updatedCount} selected activities updated with target quotas.`);
      } catch (err: any) {
          toast.error(`Error updating backend: ${err.message}`);
      }
  } else {
      toast.warning("No matching user target quotas found for selected activities.");
  }
};


    // ✅ Checkbox logic
    const toggleSelectAll = () => {
        if (selectedIds.size === current.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(current.map((a) => a.id)));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    return (
        <SidebarProvider>
            <AppSidebar userId={userId} />
            <SidebarInset>
                {/* Header */}
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                        Home
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Taskflow</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Activity Logs</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search activities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 w-full"
                        />
                        {isFetching && (
                            <Loader2 className="absolute right-2 top-2.5 size-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    <ButtonGroup>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 text-sm flex items-center gap-1"
                            onClick={handleFixMissingQuota}
                        >
                            <RefreshCw className="w-4 h-4" /> Fix Missing Quotas
                        </Button>

                        {selectedIds.size > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-10 text-sm flex items-center gap-1"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="w-4 h-4" /> Delete {selectedIds.size}
                            </Button>
                        )}
                    </ButtonGroup>
                </div>

                {/* Table */}
                <div className="mx-4 border border-border shadow-sm rounded-lg overflow-hidden">
                    {isFetching ? (
                        <div className="py-10 text-center flex flex-col items-center gap-2 text-muted-foreground text-xs">
                            <Loader2 className="size-6 animate-spin" />
                            <span>Loading activities...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1150px] w-full text-sm">
                                <TableHeader className="bg-muted sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="w-10 text-center">
                                            <Checkbox
                                                checked={selectedIds.size === current.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Activity #</TableHead>
                                        <TableHead>Company Info</TableHead>
                                        <TableHead>Project Details</TableHead>
                                        <TableHead>CSR Agent</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {current.map((act, index) => (
                                        <TableRow key={act.id || `activity-${index}`} className="even:bg-muted/40">
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={selectedIds.has(act.id)}
                                                    onCheckedChange={() => toggleSelect(act.id)}
                                                />
                                            </TableCell>

                                            <TableCell>{act.activitynumber || "—"}</TableCell>

                                            <TableCell className="text-[11px] leading-tight">
                                                <strong>{act.companyname || "—"}</strong>
                                                <br />
                                                {act.contactperson} / {act.contactnumber}
                                                <br />
                                                {act.emailaddress}
                                                <br />
                                                <span className="text-muted-foreground">{act.address}</span>
                                            </TableCell>

                                            <TableCell className="text-[11px] leading-tight">
                                                <div>
                                                    <b>{act.projectname}</b> ({act.projectcategory})
                                                </div>
                                                <div>{act.projecttype}</div>
                                                <div>Ref ID: {act.referenceid || "—"}</div>
                                                <div>Source: {act.source}</div>
                                                <div>
                                                    Target:{" "}
                                                    {act.targetquota ? (
                                                        act.targetquota
                                                    ) : (
                                                        <span className="text-red-500 italic">Missing</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>{act.csragent || "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
