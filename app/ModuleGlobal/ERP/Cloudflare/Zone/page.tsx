"use client";

import React, { useState, useEffect, useMemo } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";

import Table from "../../../components/Cloudflare/Zone/Table";
import Filters from "../../../components/Cloudflare/Zone/Filters";
import Pagination from "../../../components/Cloudflare/Zone/Pagination";

interface Zone {
    id: string;
    name: string;
    status: string;
    created_on: string;
    paused: boolean;
}

const Page: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination states
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchZones = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/Data/Applications/Cloudflare/Zone/Fetch", {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                }

                const json = await res.json();
                if (json.success === false) {
                    throw new Error(json.error || "Failed to load zones");
                }
                if (!Array.isArray(json.data)) {
                    throw new Error("Invalid data format from server");
                }

                setZones(json.data);
            } catch (err: any) {
                toast.error(`Error fetching zones: ${err.message}`);
                setZones([]);
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, []);

    // Filter zones based on search text
    const filteredZones = useMemo(() => {
        return zones.filter(
            (zone) =>
                zone.name.toLowerCase().includes(search.toLowerCase()) ||
                zone.id.toLowerCase().includes(search.toLowerCase())
        );
    }, [zones, search]);

    // Pagination logic
    const paginatedZones = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredZones.slice(start, start + itemsPerPage);
    }, [filteredZones, currentPage]);

    const totalPages = Math.ceil(filteredZones.length / itemsPerPage);

    // Export filtered zones to Excel
    const handleExport = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Cloudflare Zones");

            worksheet.columns = [
                { header: "ID", key: "id", width: 36 },
                { header: "Name", key: "name", width: 30 },
                { header: "Status", key: "status", width: 15 },
                { header: "Paused", key: "paused", width: 10 },
                { header: "Created On", key: "created_on", width: 25 },
            ];

            filteredZones.forEach((zone) => {
                worksheet.addRow({
                    id: zone.id,
                    name: zone.name,
                    status: zone.status,
                    paused: zone.paused ? "Yes" : "No",
                    created_on: new Date(zone.created_on).toLocaleString(),
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Cloudflare_Zones.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to export zones to Excel");
        }
    };

    return (
        <SessionChecker>
            <ParentLayout>
                <UserFetcher>
                    {() => (
                        <div className="container mx-auto p-4 text-gray-900">
                            <div className="mb-4 p-4 bg-white border shadow-md rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Cloudflare - Zones</h2>
                                </div>

                                {/* Export button */}
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={handleExport}
                                        className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-600 text-xs"
                                    >
                                        Export Excel
                                    </button>
                                </div>

                                {/* Filters component */}
                                <Filters
                                    search={search}
                                    setSearch={(value) => {
                                        setSearch(value);
                                        setCurrentPage(1);
                                    }}
                                />

                                {/* Loading, no data, or table */}
                                {loading ? (
                                    <p>Loading zones...</p>
                                ) : filteredZones.length === 0 ? (
                                    <p>No zones found.</p>
                                ) : (
                                    <>
                                        <Table data={paginatedZones} />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </>
                                )}
                            </div>
                            <ToastContainer className="text-xs" autoClose={1500} />
                        </div>
                    )}
                </UserFetcher>
            </ParentLayout>
        </SessionChecker>
    );
};

export default Page;
