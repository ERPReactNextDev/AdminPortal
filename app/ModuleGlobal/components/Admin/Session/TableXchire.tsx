"use client";

import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ✅ Dynamic imports (client-only)
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

const TableXchire = ({ data }: { data: any[] }) => {
  const [L, setL] = useState<any>(null); // Leaflet instance
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // ✅ Load Leaflet only in browser
  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      setL(leaflet);
    })();
  }, []);

  // ✅ Export to Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Session Logs");

    worksheet.columns = [
      { header: "Status", key: "status", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Department", key: "department", width: 20 },
      { header: "Timestamp", key: "timestamp", width: 25 },
      { header: "IP Address", key: "ipAddress", width: 20 },
      { header: "User Agent", key: "userAgent", width: 40 },
      { header: "Device ID", key: "deviceId", width: 25 },
      { header: "Latitude", key: "latitude", width: 15 },
      { header: "Longitude", key: "longitude", width: 15 },
    ];

    data.forEach((item) =>
      worksheet.addRow({
        ...item,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString()
          : "N/A",
      })
    );

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
      <div className="flex justify-end mb-3">
        <button
          onClick={exportToExcel}
          className="border text-black px-4 py-2 rounded text-xs flex shadow-md hover:bg-gray-100"
        >
          Export to Excel
        </button>
      </div>

      {/* ✅ TABLE for Desktop */}
      <div className="hidden md:block">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr className="text-xs text-left whitespace-nowrap border-l-4 border-orange-400">
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700">User Info</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-700">IP Address</th>
              <th className="px-6 py-4 font-semibold text-gray-700">User Agent</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Device ID</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length ? (
              data.map((post) => (
                <tr key={post._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`text-white px-4 py-2 rounded-full capitalize ${statusColors[post.status] || "bg-gray-400"}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{post.email}<br />{post.department}</td>
                  <td className="px-6 py-4 text-xs">
                    {post.timestamp
                      ? new Date(post.timestamp).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-xs">{post.ipAddress || "N/A"}</td>
                  <td className="px-6 py-4 text-xs break-all max-w-xs">
                    {post.userAgent || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-xs">{post.deviceId || "N/A"}</td>
                  <td className="px-6 py-4 text-xs">
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
      </div>

      {/* ✅ CARD View for Mobile */}
      <div className="block md:hidden space-y-3">
        {data.length ? (
          data.map((post) => (
            <div
              key={post._id}
              className="border rounded-lg p-3 shadow-sm bg-white"
            >
              <div className="flex justify-between mb-2">
                <span
                  className={`text-white text-[10px] px-2 py-1 rounded ${statusColors[post.status] || "bg-gray-400"}`}
                >
                  {post.status}
                </span>
                <small className="text-gray-500">
                  {post.timestamp
                    ? new Date(post.timestamp).toLocaleString()
                    : "N/A"}
                </small>
              </div>
              <div className="text-xs">
                <p><strong>Email:</strong> {post.email}</p>
                <p><strong>Dept:</strong> {post.department}</p>
                <p><strong>IP:</strong> {post.ipAddress || "N/A"}</p>
                <p><strong>Device:</strong> {post.deviceId || "N/A"}</p>
                <p className="break-all">
                  <strong>UserAgent:</strong> {post.userAgent || "N/A"}
                </p>
                {post.latitude && post.longitude && (
                  <button
                    onClick={() =>
                      handleViewLocation(post.latitude, post.longitude)
                    }
                    className="mt-2 text-blue-600 underline"
                  >
                    View Location
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm">
            No session logs available
          </p>
        )}
      </div>

      {/* ✅ MAP MODAL */}
      {selectedLocation && L && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999]">
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
