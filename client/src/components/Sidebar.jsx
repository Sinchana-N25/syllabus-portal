import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth0();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-white border border-slate-200 rounded-full p-1 hover:bg-slate-50 text-slate-500 shadow-sm z-10"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Teacher Name Area */}
      <div
        className={`p-6 flex flex-col items-center border-b border-slate-100 ${
          collapsed ? "px-2" : ""
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
          <User size={24} />
        </div>
        {!collapsed && (
          <h3 className="font-bold text-slate-800 text-center truncate w-full text-lg">
            {user.name}
          </h3>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-600 mb-2 cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LayoutDashboard size={20} />
          {!collapsed && <span className="font-medium">Dashboard</span>}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className={`flex items-center gap-3 p-3 w-full rounded-lg text-red-500 hover:bg-red-50 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
