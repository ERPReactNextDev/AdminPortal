"use client";

import React, { useState } from "react";
import { FaCopy } from "react-icons/fa";

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

interface TableProps {
  data: FirewallRule[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const toggleIdVisibility = (id: string) => {
    setVisibleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      alert("Failed to copy");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0 z-10 text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
          <tr className="bg-gray-100">
            <th className="px-3 py-3 font-semibold text-gray-700">Description</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Action</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Filter Expression</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Paused</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Created On</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Modified On</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Zone ID</th>
            <th className="px-3 py-3 font-semibold text-gray-700">ID</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((rule) => (
            <tr key={rule.id} className="border-b whitespace-nowrap hover:bg-gray-100">
              <td className="px-4 py-2 text-xs">{rule.description}</td>
              <td className="px-4 py-2 text-xs">{rule.action}</td>
              <td className="px-4 py-2 text-xs">{rule.filter.expression}</td>
              <td className="px-4 py-2 text-xs">{rule.paused ? "Yes" : "No"}</td>
              <td className="px-4 py-2 text-xs">{new Date(rule.created_on).toLocaleString()}</td>
              <td className="px-4 py-2 text-xs">{new Date(rule.modified_on).toLocaleString()}</td>
              <td className="px-4 py-2 text-xs">{rule.zone_id}</td>
              <td className="px-4 py-2 text-xs">{visibleIds.has(rule.id) ? rule.id : "••••••••••"}</td>
              <td className="px-4 py-2 text-xs">
                <button
                  onClick={() => toggleIdVisibility(rule.id)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] px-2 py-1 rounded"
                >
                  {visibleIds.has(rule.id) ? "Hide ID" : "Show ID"}
                </button>
                <button
                  onClick={() => copyToClipboard(rule.filter.expression)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 justify-center"
                  title="Copy filter expression"
                >
                  <FaCopy />
                  Copy Expr
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
