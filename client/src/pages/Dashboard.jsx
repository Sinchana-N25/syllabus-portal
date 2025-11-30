import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "../components/Sidebar";
import { Plus, Search, LayoutGrid, List as ListIcon } from "lucide-react";
// We will create these components in the next steps
import CreateModal from "../components/CreateModal";
// import ViewModal from '../components/ViewModal'; // Coming soon

const Dashboard = () => {
  const { user } = useAuth0();
  const [syllabusList, setSyllabusList] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchSyllabus = async () => {
    try {
      if (!user) return; // Guard clause
      const url = `${import.meta.env.VITE_API_URL}?userId=${
        user.sub
      }&search=${search}`;
      const response = await axios.get(url);
      setSyllabusList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch Data from Backend
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSyllabus();
  }, [search]); // Re-run when search changes

  return (
    <div className="flex h-screen bg-slate-50 w-full">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              My Subjects
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-md w-full ml-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by subject code or name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500"
                }`}
              >
                <ListIcon size={18} />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={20} />
              <span>Create New</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          {syllabusList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No subjects found. Create one to get started!</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {syllabusList.map((item) => (
                // This is a Placeholder for the Card Component we will build next
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <h3 className="font-bold text-lg text-slate-800 mb-1">
                    {item.courseTitle}
                  </h3>
                  <div className="text-sm font-mono text-slate-500 mb-4">
                    {item.courseCode}
                  </div>
                  <div className="flex gap-2 text-xs text-slate-500 mb-4">
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      Sem: {item.semester}
                    </span>
                    <span className="bg-slate-100 px-2 py-1 rounded">
                      Credits: {item.credits}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals will go here */}
      {isCreateModalOpen && (
        <CreateModal
          onClose={() => setIsCreateModalOpen(false)}
          refreshData={fetchSyllabus}
        />
      )}
    </div>
  );
};

export default Dashboard;
