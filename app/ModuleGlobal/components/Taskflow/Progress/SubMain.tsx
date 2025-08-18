"use client";

import React from "react";
import ButtonPanels from "./ButtonPanels";
import TableXchire from "./TableXchire";
import GridXchire from "./GridXchire";
import AnalyticsXchire from "./Analytics/AnalyticsXchire";

interface SubMainProps {
  updatedUser: any[];
  bulkDeleteMode: boolean;
  bulkEditMode: boolean;
  selectedUsers: Set<string>;
  handleSelectUser: (id: string) => void;
  handleEdit: (post: any) => void;
  formatDate: (timestamp: number) => string;
  statusColors: Record<string, string>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleBulkDeleteMode: () => void;
  toggleBulkEditMode: () => void;
  handleBulkDelete: () => void;
  handleBulkEdit: () => void;
  handleSelectAll: () => void;
  newTargetQuota: string;
  setNewTargetQuota: (val: string) => void;
  totalQuotation: number;
  totalSOAmount: number;
  totalActualSales: number;
}

const SubMain: React.FC<SubMainProps> = ({
  updatedUser,
  bulkDeleteMode,
  bulkEditMode,
  selectedUsers,
  handleSelectUser,
  handleEdit,
  formatDate,
  statusColors,
  activeTab,
  setActiveTab,
  toggleBulkDeleteMode,
  toggleBulkEditMode,
  handleBulkDelete,
  handleBulkEdit,
  handleSelectAll,
  newTargetQuota,
  setNewTargetQuota,
  totalQuotation,
  totalSOAmount,
  totalActualSales,
}) => {
  return (
    <div className="mb-4">
      <ButtonPanels
        bulkDeleteMode={bulkDeleteMode}
        bulkEditMode={bulkEditMode}
        toggleBulkDeleteMode={toggleBulkDeleteMode}
        toggleBulkEditMode={toggleBulkEditMode}
        selectedUsers={selectedUsers}
        updatedUser={updatedUser}
        handleSelectAll={handleSelectAll}
        handleBulkDelete={handleBulkDelete}
        handleBulkEdit={handleBulkEdit}
        newTargetQuota={newTargetQuota}
        setNewTargetQuota={setNewTargetQuota}
      />

      <div className="flex space-x-2 mb-4 text-[10px]">
        <button
          className={`px-4 py-2 rounded ${activeTab === "table" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("table")}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("grid")}
        >
          Grid View
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "analytics" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {activeTab === "table" ? (
        <div className="overflow-x-auto">
          <TableXchire
            updatedUser={updatedUser}
            bulkDeleteMode={bulkDeleteMode}
            bulkEditMode={bulkEditMode}
            selectedUsers={selectedUsers}
            handleSelectUser={handleSelectUser}
            handleEdit={handleEdit}
            totalQuotation={totalQuotation}
            totalSOAmount={totalSOAmount}
            totalActualSales={totalActualSales}
            statusColors={statusColors}
          />
        </div>
      ) : activeTab === "grid" ? (
        <GridXchire
          updatedUser={updatedUser}
          selectedUsers={selectedUsers}
          bulkDeleteMode={bulkDeleteMode}
          bulkEditMode={bulkEditMode}
          handleSelectUser={handleSelectUser}
          handleEdit={handleEdit}
          statusColors={statusColors}
        />
      ) : (
        <AnalyticsXchire updatedUser={updatedUser} />
      )}
    </div>
  );
};

export default SubMain;
