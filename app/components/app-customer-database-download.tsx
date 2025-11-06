"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { SpinnerItem } from "../components/app-user-accounts-download-spinner";

interface DownloadProps {
  data: any[];
  filename?: string;
}

export const Download: React.FC<DownloadProps> = ({ data, filename = "CustomerDatabase" }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data.length) {
      alert("No data available to download.");
      return;
    }

    setIsDownloading(true);

    const headers = [
      "companyname",
      "contactperson",
      "contactnumber",
      "emailaddress",
      "typeclient",
      "address",
      "area",
      "status",
      "companygroup",
      "deliveryaddress",
    ];

    const rows = data.map((c) => [
      c.companyname,
      c.contactperson,
      c.contactnumber,
      c.emailaddress,
      c.typeclient,
      c.address,
      c.area,
      c.status,
      c.companygroup,
      c.deliveryaddress,
    ]);

    const csvContentArray = [headers, ...rows].map((row) =>
      row.map((cell) => `"${cell || ""}"`).join(",")
    );

    const totalBytes = csvContentArray.reduce((acc, row) => acc + row.length, 0);

    let canceled = false;
    let currentBytes = 0;

    // Show spinner in Sonner toast
    const toastId = toast(
      <SpinnerItem
        currentBytes={currentBytes}
        totalBytes={totalBytes}
        fileCount={data.length}
        onCancel={() => {
          canceled = true;
        }}
      />,
      { duration: Infinity }
    );

    try {
      const csvContentLines: string[] = [];

      for (let i = 0; i < csvContentArray.length; i++) {
        if (canceled) throw new Error("Download canceled");

        csvContentLines.push(csvContentArray[i]);
        currentBytes = csvContentLines.join("\n").length;

        // update toast by re-rendering the SpinnerItem
        toast(
          <SpinnerItem
            currentBytes={currentBytes}
            totalBytes={totalBytes}
            fileCount={data.length}
            onCancel={() => {
              canceled = true;
            }}
          />,
          { id: toastId, duration: Infinity }
        );

        await new Promise((res) => setTimeout(res, 5)); // simulate progress
      }

      const csvContent = csvContentLines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV download complete!", { id: toastId });
    } catch (err) {
      if ((err as Error).message === "Download canceled") {
        toast.error("CSV download canceled.", { id: toastId });
      } else {
        toast.error("Failed to download CSV.", { id: toastId });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button variant="default" size="sm" onClick={handleDownload} disabled={isDownloading}>
      <DownloadIcon className="size-4 mr-1" /> Download
    </Button>
  );
};
