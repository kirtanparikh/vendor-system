"use client";

import axios from "axios";
import Cookies from "js-cookie";
import {
  Activity,
  Car,
  Layers,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic Import
const Tree = dynamic(() => import("react-d3-tree"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full text-gray-500">
      Loading...
    </div>
  ),
});

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [treeData, setTreeData] = useState([]);
  const [stats, setStats] = useState({ regions: 0, drivers: 0 });

  // ... (Keep existing useEffect, handleLogin, fetchData, handleLogout logic) ...
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      fetchData(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      Cookies.set("token", res.data.token, { expires: 1 });
      setIsLoggedIn(true);
      fetchData(res.data.token);
    } catch (err) {
      alert("Login Failed");
    }
  };

  const fetchData = async (token) => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vendors/hierarchy",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTreeData(res.data.data);
      // Stats logic...
      if (res.data.data.length) {
        setStats({
          regions: res.data.data[0]?.children?.length || 0,
          drivers: 45,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- UPDATED CARD RENDERER ---
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const role = (
      nodeDatum.role ||
      nodeDatum.attributes?.role ||
      ""
    ).toLowerCase();
    const id = nodeDatum.id || nodeDatum.attributes?.id || "NEW";

    // 1. Determine Styles & Icon
    let style = {
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "VENDOR",
      Icon: Layers,
    };

    if (role.includes("admin")) {
      style = {
        border: "border-slate-800",
        bg: "bg-slate-900",
        text: "text-white",
        label: "HQ",
        Icon: ShieldCheck,
      };
    } else if (role.includes("manager")) {
      style = {
        border: "border-purple-500",
        bg: "bg-purple-50",
        text: "text-purple-700",
        label: "REGION",
        Icon: MapPin,
      };
    } else if (role.includes("vendor") || role.includes("city")) {
      style = {
        border: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "CITY OPS",
        Icon: Activity,
      };
    }

    // Driver Logic
    if (role.includes("driver")) {
      style = {
        border: "border-orange-500",
        bg: "bg-orange-50",
        text: "text-orange-700",
        label: "DRIVER",
        Icon: Truck,
      };
    }
    // Vehicle Logic (If you added them)
    if (role.includes("vehicle")) {
      style = {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        label: "VEHICLE",
        Icon: Car,
      };
    }

    // 2. Determine Detail Text (Email vs License vs Model)
    let detailText = nodeDatum.email || nodeDatum.attributes?.email || "N/A";

    if (role.includes("driver")) {
      detailText = `Lic: ${nodeDatum.attributes?.license_no || "PENDING"}`;
    } else if (role.includes("vehicle")) {
      detailText = `Model: ${nodeDatum.attributes?.model || "Unknown"}`;
    }

    return (
      <foreignObject width="240" height="110" x="-120" y="-55">
        <div
          className={`w-full h-full bg-white rounded-lg border-l-4 ${style.border} shadow-md p-3 cursor-pointer hover:scale-105 transition flex flex-col justify-between`}
          onClick={toggleNode}
        >
          {/* Header: Badge & ID */}
          <div className="flex justify-between items-start">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
            >
              <style.Icon className="w-3 h-3" /> {style.label}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">#{id}</span>
          </div>

          {/* Body: Name & Details */}
          <div>
            <div
              className="font-bold text-slate-800 text-sm truncate"
              title={nodeDatum.name}
            >
              {nodeDatum.name}
            </div>
            <div
              className="text-[10px] text-slate-500 truncate"
              title={detailText}
            >
              {detailText}
            </div>
          </div>

          {/* Footer: Status */}
          <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] text-slate-400 font-medium uppercase">
              Active
            </span>
          </div>
        </div>
      </foreignObject>
    );
  };

  if (!isLoggedIn)
    return (
      /* ... Keep Login UI ... */
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Layers className="text-blue-600" /> VendorOS
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="w-full p-2 border rounded text-slate-900"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded text-slate-900"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-slate-900 text-white p-2 rounded hover:bg-slate-800">
              Login
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <nav className="h-14 bg-white border-b px-6 flex justify-between items-center shrink-0 z-10">
        <div className="font-bold text-lg flex items-center gap-2 text-slate-800">
          <Layers className="text-blue-600" /> VendorOS
        </div>
        <button
          onClick={() => {
            Cookies.remove("token");
            setIsLoggedIn(false);
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </nav>
      <div className="flex-1 relative w-full h-full">
        <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow border z-10 w-48">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">
            Overview
          </div>
          <div className="flex justify-between text-sm mb-1 text-slate-700">
            <span>Regions</span>
            <span className="font-bold">{stats.regions}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-700">
            <span>Fleet</span>
            <span className="font-bold">{stats.drivers}</span>
          </div>
        </div>
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 600, y: 100 }}
          nodeSize={{ x: 260, y: 180 }}
          renderCustomNodeElement={renderCustomNode}
        />
      </div>
    </div>
  );
}
