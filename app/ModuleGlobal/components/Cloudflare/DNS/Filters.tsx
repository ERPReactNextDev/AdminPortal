"use client";

import React from "react";

interface FiltersProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Filters: React.FC<FiltersProps> = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  setCurrentPage,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by Name, Zone or ID..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
      />

      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="shadow-sm border px-3 py-2 rounded text-xs capitalize"
      >
        <option value="">All Status</option>
        <option value="proxied">Proxied</option>
        <option value="dns only">DNS Only</option>
      </select>
    </div>
  );
};

export default Filters;
