"use client";

import axios from "axios";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { LogOut, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import Tree from "react-d3-tree";

interface VendorNode {
  name: string;
  attributes?: {
    role: string;
    email: string;
  };
  children?: VendorNode[];
}

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [treeData, setTreeData] = useState<VendorNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
      fetchHierarchy(token);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token } = response.data;
      Cookies.set("token", token, { expires: 1 });
      setIsLoggedIn(true);
      fetchHierarchy(token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async (token: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/vendors/hierarchy",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTreeData(response.data.hierarchy);
    } catch (err) {
      setError("Failed to fetch vendor hierarchy");
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

  const renderCustomNode = ({ nodeDatum }: any) => (
    <g>
      <circle r={40} fill="#3b82f6" stroke="#1e40af" strokeWidth={2} />
      <text
        fill="#fff"
        strokeWidth="0"
        x="0"
        y="-5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {nodeDatum.attributes?.role || "Vendor"}
      </text>
      <text
        fill="#fff"
        strokeWidth="0"
        x="0"
        y="10"
        textAnchor="middle"
        fontSize="10"
      >
        {nodeDatum.name}
      </text>
      <text
        fill="#fff"
        strokeWidth="0"
        x="0"
        y="25"
        textAnchor="middle"
        fontSize="8"
      >
        {nodeDatum.attributes?.email}
      </text>
    </g>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-6">
            <TreePine className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Vendor System
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Sign in to view the hierarchy
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="admin@vendorsystem.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Test credentials:</p>
            <p className="font-mono text-xs mt-1">
              admin@vendorsystem.com / admin123
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <TreePine className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Vendor Hierarchy</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="h-[calc(100vh-4rem)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading hierarchy...</p>
            </div>
          </div>
        ) : treeData.length > 0 ? (
          <Tree
            data={treeData}
            orientation="vertical"
            pathFunc="step"
            translate={{ x: 400, y: 100 }}
            nodeSize={{ x: 200, y: 200 }}
            renderCustomNodeElement={renderCustomNode}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No vendor data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
