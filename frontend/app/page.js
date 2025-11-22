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
      if (res.data.data.length) {
        const countNodes = (nodes, targetRole) => {
          let count = 0;
          const traverse = (node) => {
            const role = (
              node.role ||
              node.attributes?.role ||
              ""
            ).toLowerCase();
            if (role === targetRole) count++;
            if (node.children) node.children.forEach(traverse);
          };
          nodes.forEach(traverse);
          return count;
        };

        setStats({
          regions: res.data.data[0]?.children?.length || 0,
          drivers:
            countNodes(res.data.data, "driver") +
            countNodes(res.data.data, "vehicle"),
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

    if (role.includes("super_vendor") || role === "super_vendor") {
      style = {
        border: "border-slate-800",
        bg: "bg-slate-900",
        text: "text-white",
        label: "HQ",
        Icon: ShieldCheck,
      };
    } else if (nodeDatum.parent_id === 2 && role.includes("sub_vendor")) {
      style = {
        border: "border-purple-500",
        bg: "bg-purple-50",
        text: "text-purple-700",
        label: "REGION",
        Icon: MapPin,
      };
    } else if (role.includes("sub_vendor")) {
      style = {
        border: "border-emerald-500",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        label: "CITY OPS",
        Icon: Activity,
      };
    }

    if (role.includes("driver")) {
      style = {
        border: "border-orange-500",
        bg: "bg-orange-50",
        text: "text-orange-700",
        label: "DRIVER",
        Icon: Truck,
      };
    }
    if (role.includes("vehicle")) {
      style = {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        label: "VEHICLE",
        Icon: Car,
      };
    }

    let detailText = nodeDatum.email || nodeDatum.attributes?.email || "N/A";

    if (role.includes("driver")) {
      detailText = `Lic: ${nodeDatum.attributes?.license_no || "PENDING"}`;
    } else if (role.includes("vehicle")) {
      detailText = `Model: ${nodeDatum.attributes?.model || "Unknown"}`;
    }

    return (
      <foreignObject width="220" height="90" x="-110" y="-45">
        <div
          className={`w-full h-full bg-white rounded border-l-4 ${style.border} shadow p-2 cursor-pointer`}
          onClick={toggleNode}
        >
          <div className="flex justify-between items-start mb-1">
            <div
              className={`flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-bold ${style.bg} ${style.text}`}
            >
              <style.Icon className="w-2.5 h-2.5" /> {style.label}
            </div>
            <span className="text-[9px] text-slate-400">#{id}</span>
          </div>
          <div className="font-bold text-slate-800 text-xs truncate">
            {nodeDatum.name}
          </div>
          <div className="text-[9px] text-slate-500 truncate">{detailText}</div>
        </div>
      </foreignObject>
    );
  };

  if (!isLoggedIn)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-6 rounded shadow w-80">
          <h1 className="text-xl font-bold mb-4">Vendor System</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-slate-900 text-white p-2 rounded">
              Login
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <nav className="h-12 bg-white border-b px-4 flex justify-between items-center">
        <div className="font-bold">Vendor System</div>
        <button
          onClick={() => {
            Cookies.remove("token");
            setIsLoggedIn(false);
          }}
          className="text-sm text-red-500"
        >
          Logout
        </button>
      </nav>
      <div className="flex-1 relative">
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow z-10 text-xs">
          <div className="flex gap-4">
            <div>Regions: {stats.regions}</div>
            <div>Fleet: {stats.drivers}</div>
          </div>
        </div>
        <Tree
          data={treeData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 600, y: 100 }}
          nodeSize={{ x: 240, y: 150 }}
          renderCustomNodeElement={renderCustomNode}
        />
      </div>
    </div>
  );
}
