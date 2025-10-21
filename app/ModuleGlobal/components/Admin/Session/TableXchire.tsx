"use client";
import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css"; // ✅ Import Leaflet CSS globally

// ✅ Dynamic imports for Leaflet components
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

import L from "leaflet";

// ✅ Fix missing marker icons in Next.js builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface TableXchireProps {
  data: any[];
  handleEdit?: (post: any) => void;
  handleDelete?: (postId: string) => void;
  Role?: string;
  Department?: string;
}

const TableXchire: React.FC<TableXchireProps> = ({ data }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  // ✅ Ensure map recalculates size after modal opens
  useEffect(() => {
    if (selectedLocation) {
      setTimeout(() => {
        setIsMapReady(true);
      }, 200); // small delay so map can mount correctly
    } else {
      setIsMapReady(false);
    }
  }, [selectedLocation]);

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
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Session_Logs.xlsx");
  };

  const statusColors: { [key: string]: string } = {
    login: "bg-green-800",
    logout: "bg-red-600",
  };

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

      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
            <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Department</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Timestamp</th>
            <th className="px-6 py-4 font-semibold text-gray-700">IP Address</th>
            <th className="px-6 py-4 font-semibold text-gray-700">User Agent</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Device ID</th>
            <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((post) => (
              <tr
                key={post._id}
                className="whitespace-nowrap hover:bg-gray-50 border-t text-xs"
              >
                <td className="px-4 py-2">
                  <span
                    className={`badge text-white shadow-md px-2 py-1 rounded-xl text-[10px] ${
                      statusColors[post.status] || "bg-gray-400"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">{post.email}</td>
                <td className="px-6 py-4 text-xs">{post.department}</td>
                <td className="px-6 py-4 text-xs">
                  {post.timestamp
                    ? new Date(post.timestamp).toLocaleString()
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-xs">{post.ipAddress || "N/A"}</td>
                <td className="px-6 py-4 text-xs">{post.userAgent || "N/A"}</td>
                <td className="px-6 py-4 text-xs">{post.deviceId || "N/A"}</td>
                <td className="px-6 py-4 text-xs">
                  {post.latitude && post.longitude ? (
                    <button
                      onClick={() =>
                        handleViewLocation(post.latitude, post.longitude)
                      }
                      className="text-blue-600 underline text-xs"
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
              <td
                colSpan={8}
                className="text-center px-4 py-4 text-gray-500 text-sm"
              >
                No session logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Map Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-700 text-sm"
              onClick={() => setSelectedLocation(null)}
            >
              ✖ Close
            </button>
            <h3 className="text-sm font-semibold mb-2">
              📍 {selectedLocation.address}
            </h3>
            <div className="h-72 w-full rounded-lg overflow-hidden">
              {isMapReady && (
                <MapContainer
                  key={`${selectedLocation.lat}-${selectedLocation.lng}`}
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="h-full w-full z-10"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                  >
                    <Popup>{selectedLocation.address}</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableXchire;
