"use client";

import axios from "axios";
import Cookies from "js-cookie";
import { LogOut, Layers, MapPin, Truck, Activity, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// 1. DYNAMIC IMPORT
const Tree = dynamic(() => import('react-d3-tree'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 font-sans">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
      <p className="text-sm font-medium">Loading Dashboard...</p>
    </div>
  )
});

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ regions: 0, drivers: 0 });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      fetchHierarchy(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      const { token } = response.data;
      Cookies.set("token", token, { expires: 1 });
      setIsLoggedIn(true);
      fetchHierarchy(token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/vendors/hierarchy", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data;
      setTreeData(data);

      if (data && data.length > 0) {
        setStats({
          regions: data[0]?.children?.length || 0,
          drivers: 45
        });
      }
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setTreeData([]);
    setEmail("");
    setPassword("");
  };

  // ---------------------------------------------------------
  // 2. FIXED CARD RENDERER (Accesses properties correctly)
  // ---------------------------------------------------------
  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    // FIX 1: Access role from root OR attributes
    const rawRole = (nodeDatum.role || nodeDatum.attributes?.role || "").toLowerCase();

    // FIX 2: Access ID and Email from root OR attributes
    const displayId = nodeDatum.id || nodeDatum.attributes?.id || "NEW";
    const displayEmail = nodeDatum.email || nodeDatum.attributes?.email || "no-email@system.com";

    let borderColor = "border-blue-500";
    let bgColor = "bg-blue-50";
    let textColor = "text-blue-700";
    let label = "VENDOR";
    let icon = <Layers className="w-4 h-4" />;

    if (rawRole.includes("admin") || rawRole.includes("super")) {
      borderColor = "border-slate-800";
      bgColor = "bg-slate-900";
      textColor = "text-white";
      label = "HQ ADMIN";
      icon = <ShieldCheck className="w-4 h-4" />;
    } else if (rawRole.includes("manager") || rawRole.includes("regional")) {
      borderColor = "border-purple-500";
      bgColor = "bg-purple-50";
      textColor = "text-purple-700";
      label = "REGIONAL";
      icon = <MapPin className="w-4 h-4" />;
    } else if (rawRole.includes("vendor") || rawRole.includes("city")) {
      borderColor = "border-emerald-500";
      bgColor = "bg-emerald-50";
      textColor = "text-emerald-700";
      label = "CITY OPS";
      icon = <Activity className="w-4 h-4" />;
    }

    if (!nodeDatum.children || nodeDatum.children.length === 0) {
       if (rawRole.includes("driver") || !rawRole) {
           borderColor = "border-orange-500";
           bgColor = "bg-orange-50";
           textColor = "text-orange-700";
           label = "DRIVER";
           icon = <Truck className="w-4 h-4" />;
       }
    }

    return (
      <foreignObject width="240" height="120" x="-120" y="-60">
        <div
          className={`w-full h-full bg-white rounded-xl border-l-4 ${borderColor} shadow-lg flex flex-col justify-between p-3 cursor-pointer hover:scale-105 transition-transform duration-200 font-sans`}
          onClick={toggleNode}
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${bgColor} ${textColor}`}>
              {icon}
              <span>{label}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono font-bold">
              #{displayId}
            </div>
          </div>

          {/* Body */}
          <div className="mt-1">
             <h3 className="text-sm font-bold text-slate-800 leading-tight">
               {nodeDatum.name.length > 22 ? nodeDatum.name.substring(0, 20) + "..." : nodeDatum.name}
             </h3>
             <p className="text-[10px] text-slate-500 mt-0.5 truncate" title={displayEmail}>
               {displayEmail}
             </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-slate-600">Active & Compliant</span>
          </div>
        </div>
      </foreignObject>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border border-slate-100">
          <div className="bg-slate-900 p-12 md:w-2/5 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <Layers className="w-16 h-16 mb-6 text-blue-400" />
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Vendor<span className="text-blue-400">OS</span></h1>
            <p className="text-slate-400 text-sm">Next-Gen Fleet Hierarchy System</p>
          </div>
          <div className="p-12 md:w-3/5">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Secure Workspace</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm" placeholder="admin@vendorsystem.com" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm" placeholder="••••••••" required />
              </div>
              {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">{error}</div>}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition shadow-lg shadow-blue-600/20 text-sm">
                {loading ? "Verifying Credentials..." : "Login to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded text-white"><Layers className="w-5 h-5" /></div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Vendor<span className="text-blue-600">OS</span></h1>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 hover:border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </nav>

      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-200 w-64 space-y-3">
          <div className="flex items-center justify-between">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Network</h3>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
               <div className="text-lg font-bold text-slate-800">{stats.regions}</div>
               <div className="text-[10px] text-slate-500 uppercase font-semibold">Regions</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
               <div className="text-lg font-bold text-slate-800">{stats.drivers || 45}+</div>
               <div className="text-[10px] text-slate-500 uppercase font-semibold">Fleet</div>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '100%' }} className="bg-slate-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full"><p className="text-slate-400 font-medium animate-pulse">Syncing Hierarchy...</p></div>
          ) : treeData.length > 0 ? (
            <Tree
              data={treeData}
              orientation="vertical"
              pathFunc="step"
              translate={{ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400, y: 100 }}
              nodeSize={{ x: 280, y: 200 }}
              renderCustomNodeElement={renderCustomNode}
              separation={{ siblings: 1.2, nonSiblings: 1.5 }}
              enableLegacyTransitions={true}
              zoomable={true}
              draggable={true}
              scaleExtent={{ min: 0.2, max: 1.5 }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Layers className="w-12 h-12 mb-2 opacity-20"/>
              <p className="font-medium">No Data Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
