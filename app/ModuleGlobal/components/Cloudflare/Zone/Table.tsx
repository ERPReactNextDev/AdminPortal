"use client";

import React, { useState } from "react";
import { FaUnlockAlt } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";

interface Zone {
  id: string;
  name: string;
  status: string;
  created_on: string;
  paused: boolean;
}

interface TableProps {
  data: Zone[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  const [visibleIdRows, setVisibleIdRows] = useState<Set<string>>(new Set());

  const toggleIdVisibility = (id: string) => {
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

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      alert("ID copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy ID:", err);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200 sticky top-0 z-10 text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
          <tr className="bg-gray-100">
            <th className="px-3 py-3 font-semibold text-gray-700">Name</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Status</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Paused</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Created On</th>
            <th className="px-3 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((zone) => (
            <tr
              key={zone.id}
              className="border-b whitespace-nowrap hover:bg-gray-100"
            >
              <td className="px-4 py-2 text-xs">
                {zone.name}
                {visibleIdRows.has(zone.id) && (
                  <div className="mt-1 text-[10px] text-gray-500 font-mono">
                    ID: {zone.id}
                  </div>
                )}
              </td>
              <td className="px-4 py-2 text-xs capitalize">{zone.status}</td>
              <td className="px-4 py-2 text-xs">{zone.paused ? "Yes" : "No"}</td>
              <td className="px-4 py-2 text-xs">
                {new Date(zone.created_on).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleIdVisibility(zone.id)}
                    className="bg-cyan-600 px-2 py-1 rounded text-white hover:bg-cyan-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <MdOutlineSecurity />
                    {visibleIdRows.has(zone.id) ? "Hide ID" : "View ID"}
                  </button>

                  <button
                    onClick={() => copyId(zone.id)}
                    className="bg-purple-600 px-2 py-1 rounded text-white hover:bg-purple-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <FaUnlockAlt />
                    Copy ID
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
