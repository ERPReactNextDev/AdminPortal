"use client";

import React, { useState, useEffect, useMemo } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";
import Table from "../../../components/Cloudflare/DNS/Table";
import Filters from "../../../components/Cloudflare/DNS/Filters";
import Pagination from "../../../components/Cloudflare/DNS/Pagination";

interface DNSItem {
  id?: string;
  name?: string;
  status?: string;
  lastModified?: string;
  zoneName?: string;
}

const Page: React.FC = () => {
  const [dnsData, setDnsData] = useState<DNSItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "proxied" | "dns only"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchDNSData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/Data/Applications/Cloudflare/DNS/Fetch", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const json = await res.json();
        if (json.success === false) {
          throw new Error(json.error || "Failed to load DNS data");
        }
        if (!Array.isArray(json.data)) {
          throw new Error("Invalid data format from server");
        }

        setDnsData(json.data);
      } catch (err: any) {
        toast.error(`Error fetching DNS data: ${err.message}`);
        setDnsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDNSData();
  }, []);

  // Filtered Data
  const filteredData = useMemo(() => {
    return dnsData
      .filter((item) => {
        const matchesSearch =
          search === "" ||
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.zoneName?.toLowerCase().includes(search.toLowerCase()) ||
          item.id?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "" ||
          (statusFilter === "proxied"
            ? item.status?.toLowerCase() === "proxied"
            : item.status?.toLowerCase() === "dns only");

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.lastModified || "").getTime();
        const dateB = new Date(b.lastModified || "").getTime();
        return dateB - dateA; // latest first
      });
  }, [dnsData, search, statusFilter]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Export to Excel
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("DNS Records");

      worksheet.columns = [
        { header: "ID", key: "id", width: 30 },
        { header: "Name", key: "name", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Zone", key: "zoneName", width: 30 },
        { header: "Last Modified", key: "lastModified", width: 25 },
      ];

      filteredData.forEach((item) => {
        worksheet.addRow({
          id: item.id || "-",
          name: item.name || "-",
          status: item.status || "-",
          zoneName: item.zoneName || "-",
          lastModified: item.lastModified
            ? new Date(item.lastModified).toLocaleString()
            : "-",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Cloudflare_DNS_Records.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to export data to Excel");
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
                  <h2 className="text-lg font-bold">Cloudflare - DNS</h2>
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleExport}
                    className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-600 text-xs"
                  >
                    Export Excel
                  </button>
                </div>
                {/* Filters and Search Bar */}
                <Filters
                  search={search}
                  setSearch={setSearch}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  setCurrentPage={setCurrentPage}
                />

                {loading ? (
                  <p>Loading data...</p>
                ) : filteredData.length === 0 ? (
                  <p>No DNS records found.</p>
                ) : (
                  <>
                    <Table data={paginatedData} />

                    {/* Pagination */}
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
