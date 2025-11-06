"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { Pagination } from "../../components/app-pagination";
import { toast } from "sonner";
import { Loader2, Search, Trash2, Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { DeleteDialog } from "../../components/app-user-accounts-delete-dialog";
import { SpinnerItem } from "../../components/app-user-accounts-download-spinner";

interface UserAccount {
    _id: string;
    status: string;
    email: string;
    department: string;
    timestamp: string;
    ipAddress: string;
    deviceId: string;
    latitude: string;
    longitude: string;
    userAgent: string;
}

export default function AccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId] = useState<string | null>(searchParams?.get("userId") ?? null);

    const [accounts, setAccounts] = useState<UserAccount[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isFetching, setIsFetching] = useState(false);
    const [search, setSearch] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            setIsFetching(true);
            const toastId = toast.loading("Fetching user accounts...");
            try {
                const res = await fetch("/api/Data/Sessions/Fetch");
                const data = await res.json();
                setAccounts(data || []);
                toast.success("User accounts loaded successfully!", { id: toastId });
            } catch (err) {
                console.error("Error fetching:", err);
                toast.error("Failed to fetch accounts", { id: toastId });
            } finally {
                setIsFetching(false);
            }
        };
        fetchAccounts();
    }, []);

    // Filtered and sorted accounts (latest timestamp first)
    const filtered = useMemo(() => {
        const list = accounts
            .filter(a =>
                [a.email, a.department]
                    .some(f => f?.toLowerCase().includes(search.toLowerCase()))
            )
            .filter(a => filterDepartment === "all" ? true : a.department === filterDepartment);

        return list.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return dateB - dateA; // latest first
        });
    }, [accounts, search, filterDepartment]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const current = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const getBadgeColor = (stat: string) => {
        const colorMap: Record<string, string> = {
            login: "bg-green-100 text-green-800",
            logout: "bg-red-100 text-red-800",
        };
        return colorMap[stat] || "bg-gray-100 text-gray-800";
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === current.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(current.map(u => u._id)));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const copy = new Set(prev);
            if (copy.has(id)) copy.delete(id);
            else copy.add(id);
            return copy;
        });
    };

    const confirmDelete = async () => {
        const toastId = toast.loading("Deleting accounts...");
        try {
            const res = await fetch("/api/Data/Sessions/Delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error("Delete failed");
            setAccounts(prev => prev.filter(a => !selectedIds.has(a._id)));
            setSelectedIds(new Set());
            toast.success("Selected accounts deleted successfully.", { id: toastId });
        } catch (err) {
            toast.error("Error deleting accounts.", { id: toastId });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    const departmentOptions = useMemo(
        () => ["all", ...new Set(accounts.map(a => a.department).filter(Boolean))],
        [accounts]
    );

    const handleDownload = async () => {
        if (!filtered.length) {
            alert("No data available to download.");
            return;
        }

        setIsDownloading(true);

        const headers = [
            "Status",
            "Email",
            "Department",
            "Timestamp",
            "IP Address",
            "Device ID",
            "Latitude",
            "Longitude",
            "User Agent",
        ];

        const rows = filtered.map((u) => [
            u.status,
            u.email,
            u.department,
            u.timestamp,
            u.ipAddress,
            u.deviceId,
            u.latitude,
            u.longitude,
            u.userAgent,
        ]);

        // Convert to CSV lines
        const csvContentArray = [headers, ...rows].map((row) =>
            row.map((cell) => `"${cell || ""}"`).join(",")
        );

        const totalBytes = csvContentArray.reduce((acc, row) => acc + row.length, 0);

        let canceled = false;
        let currentBytes = 0;

        // Show spinner toast
        const toastId = toast(
            <SpinnerItem
                currentBytes={currentBytes}
                totalBytes={totalBytes}
                fileCount={filtered.length}
                onCancel={() => {
                    canceled = true;
                }}
            />,
            { duration: Infinity }
        );

        try {
            const csvContentLines: string[] = [];

            for (let i = 0; i < csvContentArray.length; i++) {
                if (canceled) throw new Error("Download canceled");

                csvContentLines.push(csvContentArray[i]);
                currentBytes = csvContentLines.join("\n").length;

                // Update toast with progress
                toast(
                    <SpinnerItem
                        currentBytes={currentBytes}
                        totalBytes={totalBytes}
                        fileCount={filtered.length}
                        onCancel={() => {
                            canceled = true;
                        }}
                    />,
                    { id: toastId, duration: Infinity }
                );

                await new Promise((res) => setTimeout(res, 5)); // simulate progress
            }

            const csvContent = csvContentLines.join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `sessions_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV download complete!", { id: toastId });
        } catch (err) {
            if ((err as Error).message === "Download canceled") {
                toast.error("CSV download canceled.", { id: toastId });
            } else {
                toast.error("Failed to download CSV.", { id: toastId });
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar userId={userId} />
            <SidebarInset>
                {/* Header & Breadcrumb */}
                <header className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>Home</Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="#">Admin</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Sessions</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Search + Filters + Download */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 w-full"
                        />
                        {isFetching && <Loader2 className="absolute right-2 top-2.5 size-4 animate-spin text-muted-foreground" />}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <ButtonGroup>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 text-sm"
                                disabled={!filtered.length || isDownloading}
                                onClick={handleDownload}
                            >
                                <DownloadIcon className="w-4 h-4" /> Download
                            </Button>

                            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                <SelectTrigger className="w-[200px] h-10 text-sm">
                                    <SelectValue placeholder="Filter by Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departmentOptions.map(d => <SelectItem key={d} value={d}>{d === "all" ? "All Departments" : d}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {selectedIds.size > 0 && (
                                <Button variant="destructive" size="sm" className="h-10 text-sm flex items-center gap-1" onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="w-4 h-4" /> Delete {selectedIds.size}
                                </Button>
                            )}
                        </ButtonGroup>
                    </div>
                </div>

                {/* Table */}
                <div className="mx-4 border border-border shadow-sm rounded-lg overflow-auto">
                    {isFetching ? (
                        <div className="py-10 text-center flex flex-col items-center gap-2 text-muted-foreground text-xs">
                            <Loader2 className="size-6 animate-spin" />
                            <span>Loading accounts...</span>
                        </div>
                    ) : current.length > 0 ? (
                        <Table className="text-sm whitespace-nowrap">
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-10 text-center">
                                        <Checkbox checked={selectedIds.size === current.length} onCheckedChange={toggleSelectAll} />
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Latitude</TableHead>
                                    <TableHead>Longitude</TableHead>
                                    <TableHead>User Agent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {current.map(post => (
                                    <TableRow key={post._id}>
                                        <TableCell className="text-center">
                                            <Checkbox checked={selectedIds.has(post._id)} onCheckedChange={() => toggleSelect(post._id)} />
                                        </TableCell>
                                        <TableCell><Badge className={`${getBadgeColor(post.status)} font-medium`}>{post.status || "—"}</Badge></TableCell>
                                        <TableCell>{post.email || "—"}</TableCell>
                                        <TableCell>{post.department}</TableCell>
                                        <TableCell>{post.timestamp ? new Date(post.timestamp).toLocaleString() : "N/A"}</TableCell>
                                        <TableCell>{post.ipAddress || "—"}</TableCell>
                                        <TableCell className="whitespace-normal break-words max-w-[200px]">{post.deviceId || "—"}</TableCell>
                                        <TableCell>{post.latitude || "—"}</TableCell>
                                        <TableCell>{post.longitude || "—"}</TableCell>
                                        <TableCell className="whitespace-normal break-words max-w-[200px]">{post.userAgent || "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-10 text-center text-xs text-muted-foreground">No users found.</div>
                    )}
                </div>

                <DeleteDialog open={showDeleteDialog} count={selectedIds.size} onCancelAction={() => setShowDeleteDialog(false)} onConfirmAction={confirmDelete} />

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 my-4">
                    <Pagination page={page} totalPages={totalPages} onPageChangeAction={setPage} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
