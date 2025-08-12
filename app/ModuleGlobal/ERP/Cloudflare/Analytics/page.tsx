"use client";

import React, { useState, useEffect } from "react";
import ParentLayout from "../../../components/Layouts/ParentLayout";
import SessionChecker from "../../../components/Session/SessionChecker";
import UserFetcher from "../../../components/User/UserFetcher";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsItem {
  zoneId: string;
  data: {
    dimensions: { datetime: string }[];
    sum: {
      requests: number;
      cachedRequests: number;
      bandwidth: number;
      threats: number;
    };
  } | null;
}

const Page: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/Data/Applications/Cloudflare/Analytics/Fetch", {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const json = await res.json();
        if (json.success === false) {
          throw new Error(json.errors || "Failed to load analytics");
        }

        setAnalytics(json.data);
      } catch (err: any) {
        toast.error(`Error fetching analytics: ${err.message}`);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Prepare data for chart
  // We'll make a data array with one object per zone:
  // [{ zoneId, requests, cachedRequests, bandwidth, threats }, ...]
  // or null if no data

  const chartData = analytics
    ? analytics.map(({ zoneId, data }) => ({
        zoneId,
        requests: data?.sum.requests || 0,
        cachedRequests: data?.sum.cachedRequests || 0,
        bandwidth: data?.sum.bandwidth || 0,
        threats: data?.sum.threats || 0,
      }))
    : [];

  return (
    <SessionChecker>
      <ParentLayout>
        <UserFetcher>
          {() => (
            <div className="container mx-auto p-4 text-gray-900">
              <div className="mb-4 p-4 bg-white border shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-6">Cloudflare - Analytics Dashboard</h2>

                {loading ? (
                  <p>Loading analytics data...</p>
                ) : !analytics || analytics.length === 0 ? (
                  <p>No analytics data available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zoneId" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Requests"
                      />
                      <Line
                        type="monotone"
                        dataKey="cachedRequests"
                        stroke="#82ca9d"
                        name="Cached Requests"
                      />
                      <Line
                        type="monotone"
                        dataKey="bandwidth"
                        stroke="#ff7300"
                        name="Bandwidth"
                      />
                      <Line
                        type="monotone"
                        dataKey="threats"
                        stroke="#ff0000"
                        name="Threats"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <ToastContainer className="text-xs" autoClose={1500} />
            </div>
          )}
        </UserFetcher>
      </ParentLayout>
    </SessionChecker>
  );
};

export default Page;
