"use client";

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dynamic from "next/dynamic";

// ✅ Dynamically import leaflet components (client-only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// ✅ Import Leaflet CSS manually
import "leaflet/dist/leaflet.css";

const TableXchire = ({ data }: { data: any[] }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Session Logs");

    worksheet.columns = [
      { header: "Status", key: "status", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Department", key: "department", width: 25 },
      { header: "Timestamp", key: "timestamp", width: 25 },
      { header: "IP Address", key: "ipAddress", width: 20 },
      { header: "User Agent", key: "userAgent", width: 40 },
      { header: "Device ID", key: "deviceId", width: 25 },
      { header: "Latitude", key: "latitude", width: 15 },
      { header: "Longitude", key: "longitude", width: 15 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        status: item.status || "N/A",
        email: item.email,
        department: item.department,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString()
          : "N/A",
        ipAddress: item.ipAddress || "N/A",
        userAgent: item.userAgent || "N/A",
        deviceId: item.deviceId || "N/A",
        latitude: item.latitude || "N/A",
        longitude: item.longitude || "N/A",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "Session_Logs.xlsx"
    );
  };

  const statusColors: Record<string, string> = {
    login: "bg-green-800",
    logout: "bg-red-600",
  };

  // ✅ Reverse Geocoding
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch {
      return "Unable to fetch address";
    }
  };

  const handleViewLocation = async (lat: number, lng: number) => {
    const address = await getAddressFromCoords(lat, lng);
    setSelectedLocation({ lat, lng, address });
  };

  return (
    <div className="overflow-x-auto relative">
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToExcel}
          className="border text-black px-4 py-2 rounded text-xs flex shadow-md"
        >
          Export to Excel
        </button>
      </div>

      <table className="min-w-full table-auto border border-gray-200 text-xs">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr className="text-left border-l-4 border-orange-400">
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Timestamp</th>
            <th className="px-4 py-2">IP Address</th>
            <th className="px-4 py-2">User Agent</th>
            <th className="px-4 py-2">Device ID</th>
            <th className="px-4 py-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((post) => (
              <tr key={post._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <span
                    className={`text-white px-2 py-1 rounded ${statusColors[post.status] || "bg-gray-400"}`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-2">{post.email}</td>
                <td className="px-4 py-2">{post.department}</td>
                <td className="px-4 py-2">
                  {post.timestamp
                    ? new Date(post.timestamp).toLocaleString()
                    : "N/A"}
                </td>
                <td className="px-4 py-2">{post.ipAddress || "N/A"}</td>
                <td className="px-4 py-2 break-all max-w-xs">
                  {post.userAgent || "N/A"}
                </td>
                <td className="px-4 py-2">{post.deviceId || "N/A"}</td>
                <td className="px-4 py-2">
                  {post.latitude && post.longitude ? (
                    <button
                      onClick={() =>
                        handleViewLocation(post.latitude, post.longitude)
                      }
                      className="text-blue-600 underline"
                    >
                      View Location
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No session logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] max-w-2xl relative">
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-2 right-2 text-gray-700"
            >
              ✖
            </button>
            <h3 className="text-sm font-semibold mb-2">
              📍 {selectedLocation.address}
            </h3>
            <div className="h-72 w-full">
              <MapContainer
                center={[selectedLocation.lat, selectedLocation.lng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full rounded-lg"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                  <Popup>{selectedLocation.address}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableXchire;
