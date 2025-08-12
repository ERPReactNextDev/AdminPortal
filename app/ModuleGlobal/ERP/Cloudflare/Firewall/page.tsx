"use client";

import React, { useState, useEffect, useMemo } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";

import Table from "../../../components/Cloudflare/Firewall/Table";
import Filters from "../../../components/Cloudflare/Firewall/Filters";
import Pagination from "../../../components/Cloudflare/Firewall/Pagination";

interface FirewallRule {
  id: string;
  description: string;
  action: string;
  filter: {
    id: string;
    expression: string;
  };
  paused: boolean;
  created_on: string;
  modified_on: string;
  zone_id: string;
}

const Page: React.FC = () => {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchFirewallRules = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/Data/Applications/Cloudflare/FirewallRules/Fetch",
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const json = await res.json();
        if (json.success === false) {
          throw new Error(json.errors || "Failed to load firewall rules");
        }
        if (!Array.isArray(json.data)) {
          throw new Error("Invalid data format from server");
        }

        setRules(json.data);
      } catch (err: any) {
        toast.error(`Error fetching firewall rules: ${err.message}`);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFirewallRules();
  }, []);

  // Filter rules based on search
  const filteredRules = useMemo(() => {
    return rules.filter(
      (rule) =>
        rule.description.toLowerCase().includes(search.toLowerCase()) ||
        rule.action.toLowerCase().includes(search.toLowerCase()) ||
        rule.filter.expression.toLowerCase().includes(search.toLowerCase()) ||
        rule.zone_id.toLowerCase().includes(search.toLowerCase())
    );
  }, [rules, search]);

  // Pagination
  const paginatedRules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRules.slice(start, start + itemsPerPage);
  }, [filteredRules, currentPage]);

  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);

  // Export to Excel
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Cloudflare Firewall Rules");

      worksheet.columns = [
        { header: "ID", key: "id", width: 36 },
        { header: "Description", key: "description", width: 40 },
        { header: "Action", key: "action", width: 20 },
        { header: "Filter Expression", key: "expression", width: 50 },
        { header: "Paused", key: "paused", width: 10 },
        { header: "Created On", key: "created_on", width: 25 },
        { header: "Modified On", key: "modified_on", width: 25 },
        { header: "Zone ID", key: "zone_id", width: 36 },
      ];

      filteredRules.forEach((rule) => {
        worksheet.addRow({
          id: rule.id,
          description: rule.description,
          action: rule.action,
          expression: rule.filter.expression,
          paused: rule.paused ? "Yes" : "No",
          created_on: new Date(rule.created_on).toLocaleString(),
          modified_on: new Date(rule.modified_on).toLocaleString(),
          zone_id: rule.zone_id,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Cloudflare_Firewall_Rules.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export firewall rules to Excel");
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
                  <h2 className="text-lg font-bold">Cloudflare - Firewall Rules</h2>
                  <button
                    onClick={handleExport}
                    className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-600 text-xs"
                  >
                    Export Excel
                  </button>
                </div>

                <Filters
                  search={search}
                  setSearch={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                  }}
                />

                {loading ? (
                  <p>Loading firewall rules...</p>
                ) : filteredRules.length === 0 ? (
                  <p>No firewall rules found.</p>
                ) : (
                  <>
                    <Table data={paginatedRules} />
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
