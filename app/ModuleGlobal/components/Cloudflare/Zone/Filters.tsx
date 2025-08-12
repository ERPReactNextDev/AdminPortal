"use client";

import React from "react";

interface FiltersProps {
  search: string;
  setSearch: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ search, setSearch }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
      <input
        type="text"
        placeholder="Search zones by name or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="shadow-sm border px-3 py-2 rounded text-xs w-full md:w-auto flex-grow capitalize"
      />
    </div>
  );
};

export default Filters;
