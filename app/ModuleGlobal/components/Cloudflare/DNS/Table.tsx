"use client";

import React, { useState } from "react";
import { FaUnlockAlt } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";

interface DNSItem {
  id?: string;
  type?: string;
  name?: string;
  content?: string;
  ttl?: number;
  status?: string;
  lastModified?: string;
  zoneName?: string;
}

interface TableProps {
  data: DNSItem[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  const [visibleIdRows, setVisibleIdRows] = useState<Set<string | undefined>>(new Set());

  const toggleIdVisibility = (id?: string) => {
    setVisibleIdRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyContent = async (content?: string) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      alert("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0 z-10 text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
          <tr className="bg-gray-100">
            <th className="px-3 py-3 font-semibold text-gray-700">Type</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Name</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Content</th>
            <th className="px-3 py-3 font-semibold text-gray-700">TTL</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Status</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Last Modified</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={item.id || idx} className="border-b whitespace-nowrap hover:bg-gray-100">
              <td className="px-4 py-2 text-xs">{item.type || "-"}</td>
              <td className="px-4 py-2 text-xs">
                {item.name || "-"}
                {visibleIdRows.has(item.id) && (
                  <div className="mt-1 text-[10px] text-gray-500 font-mono">
                    ID: {item.id}
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-xs">
                {item.content ? "••••••••" : "-"}
              </td>
              <td className="px-4 py-2 text-xs">{item.ttl ?? "-"}</td>
              <td className="px-4 py-2 text-xs">{item.status || "-"}</td>
              <td className="px-4 py-2 text-xs">
                {item.lastModified
                  ? new Date(item.lastModified).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </td>
              <td className="px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleIdVisibility(item.id)}
                    className="bg-cyan-600 px-2 py-1 rounded text-white hover:bg-cyan-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <MdOutlineSecurity />
                    {visibleIdRows.has(item.id) ? "Hide ID" : "View ID"}
                  </button>

                  <button
                    onClick={() => copyContent(item.content)}
                    className="bg-purple-600 px-2 py-1 rounded text-white hover:bg-purple-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <FaUnlockAlt />
                    Copy Content
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
