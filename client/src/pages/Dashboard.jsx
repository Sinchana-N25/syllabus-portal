import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  Edit,
  Eye,
  Clock,
  BookOpen,
} from "lucide-react";
import CreateModal from "../components/CreateModal";
import ViewModal from "../components/ViewModal";

const Dashboard = () => {
  const { user } = useAuth0();
  const [syllabusList, setSyllabusList] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [syllabusToEdit, setSyllabusToEdit] = useState(null);

  const fetchSyllabus = async () => {
    try {
      if (!user) return;
      const url = `${import.meta.env.VITE_API_URL}?userId=${
        user.sub
      }&search=${search}`;
      const response = await axios.get(url);
      setSyllabusList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSyllabus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/${id}`);
        fetchSyllabus();
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setSyllabusToEdit(item);
    setIsCreateModalOpen(true);
  };

  const handleCreateNew = () => {
    setSyllabusToEdit(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              My Subjects
            </h1>
            <div className="relative max-w-xl w-full ml-4">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by subject code or course title..." // RESTORED PLACEHOLDER
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500"
                }`}
              >
                <ListIcon size={18} />
              </button>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={20} />
              <span>Create New</span>
            </button>
          </div>
        </header>

        {/* Content */}
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
                  : "flex flex-col gap-3"
              }
            >
              {syllabusList.map((item) =>
                viewMode === "grid" ? (
                  // --- GRID VIEW CARD ---
                  <div
                    key={item._id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col justify-between"
                  >
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => handleEdit(e, item)}
                        className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item._id)}
                        className="p-2 bg-slate-100 text-slate-600 hover:text-red-600 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-2">
                        {item.courseTitle}
                      </h3>
                      <div className="text-sm font-mono text-slate-500 mb-4">
                        {item.courseCode}
                      </div>
                      <div className="flex gap-2 text-xs text-slate-500 mb-4 flex-wrap">
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Sem: {item.semester}
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          Credits: {item.credits}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSyllabus(item)}
                      className="w-full mt-4 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  // --- COMPACT LIST VIEW ROW (New Design) ---
                  <div
                    key={item._id}
                    className="bg-white px-6 py-3 rounded-lg border border-slate-200 flex items-center gap-6 hover:shadow-md transition-shadow group"
                  >
                    {/* Code & Sem */}
                    <div className="w-24 shrink-0">
                      <div className="font-bold text-blue-600 text-sm">
                        {item.courseCode}
                      </div>
                      <div className="text-xs text-slate-400">
                        Sem {item.semester}
                      </div>
                    </div>

                    {/* Title & Credits */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {item.courseTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} /> {item.credits} Credits
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {item.totalHours} Hrs
                        </span>
                        <span className="bg-slate-100 px-1.5 rounded">
                          Marks: {item.totalMarks}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedSyllabus(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, item)}
                        className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateModal
          onClose={() => setIsCreateModalOpen(false)}
          refreshData={fetchSyllabus}
          syllabusToEdit={syllabusToEdit}
        />
      )}
      {selectedSyllabus && (
        <ViewModal
          syllabus={selectedSyllabus}
          onClose={() => setSelectedSyllabus(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
