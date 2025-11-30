import React, { useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { X, Plus, Trash2, Save } from "lucide-react";

const CreateModal = ({ onClose, refreshData }) => {
  const { user } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, modules, resources

  // Initial State matches our Mongoose Schema
  const [formData, setFormData] = useState({
    semester: "",
    courseTitle: "",
    courseCode: "",
    credits: "",
    totalHours: "",
    ltps: "",
    cie: "",
    see: "",
    totalMarks: "",
    examType: "",
    examHours: "",
    courseObjectives: "",
    teachingLearningProcess: "",
    modules: [
      { moduleNo: 1, description: "", textBookRef: "", chapter: "", rbt: "" },
    ],
    courseOutcomes: [""], // Array of strings
    textBooks: [
      { slNo: 1, author: "", title: "", publisher: "", editionYear: "" },
    ],
  });

  // Handle Simple Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Dynamic Arrays (Modules)
  const handleModuleChange = (index, field, value) => {
    const newModules = [...formData.modules];
    newModules[index][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          moduleNo: formData.modules.length + 1,
          description: "",
          textBookRef: "",
          chapter: "",
          rbt: "",
        },
      ],
    });
  };

  const removeModule = (index) => {
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: newModules });
  };

  // Handle Textbooks
  const handleTextBookChange = (index, field, value) => {
    const newBooks = [...formData.textBooks];
    newBooks[index][field] = value;
    setFormData({ ...formData, textBooks: newBooks });
  };

  const addTextBook = () => {
    setFormData({
      ...formData,
      textBooks: [
        ...formData.textBooks,
        {
          slNo: formData.textBooks.length + 1,
          author: "",
          title: "",
          publisher: "",
          editionYear: "",
        },
      ],
    });
  };

  const removeTextBook = (index) => {
    const newBooks = formData.textBooks.filter((_, i) => i !== index);
    setFormData({ ...formData, textBooks: newBooks });
  };

  // Handle Course Outcomes (Array of Strings)
  const handleOutcomeChange = (index, value) => {
    const newOutcomes = [...formData.courseOutcomes];
    newOutcomes[index] = value;
    setFormData({ ...formData, courseOutcomes: newOutcomes });
  };

  const addOutcome = () => {
    setFormData({
      ...formData,
      courseOutcomes: [...formData.courseOutcomes, ""],
    });
  };

  const removeOutcome = (index) => {
    const newOutcomes = formData.courseOutcomes.filter((_, i) => i !== index);
    setFormData({ ...formData, courseOutcomes: newOutcomes });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, userId: user.sub };
      await axios.post(import.meta.env.VITE_API_URL, payload);
      refreshData(); // Refresh Dashboard
      onClose(); // Close Modal
    } catch (error) {
      console.error("Error creating syllabus:", error);
      alert("Failed to save. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            Create New Syllabus
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          {["basic", "modules", "resources"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Info
            </button>
          ))}
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <form
            id="createForm"
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto space-y-8"
          >
            {/* --- TAB 1: BASIC INFO --- */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-2">
                  Please fill in the general details of the course .
                </div>

                <input
                  name="courseTitle"
                  placeholder="Course Title"
                  onChange={handleChange}
                  className="input-field col-span-2"
                  required
                />
                <input
                  name="courseCode"
                  placeholder="Course Code (e.g. BCS301)"
                  onChange={handleChange}
                  className="input-field"
                  required
                />
                <input
                  name="semester"
                  type="number"
                  placeholder="Semester (Number)"
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                  <input
                    name="credits"
                    type="number"
                    placeholder="Credits"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    name="totalHours"
                    placeholder="Total Hours (e.g. 40+10)"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <input
                  name="ltps"
                  placeholder="L:T:P:S (e.g. 3:0:0:0)"
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <input
                    name="cie"
                    type="number"
                    placeholder="CIE Marks"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    name="see"
                    type="number"
                    placeholder="SEE Marks"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                  <input
                    name="totalMarks"
                    type="number"
                    placeholder="Total Marks"
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <input
                  name="examType"
                  placeholder="Exam Type (Theory/Practical)"
                  onChange={handleChange}
                  className="input-field"
                  required
                />
                <input
                  name="examHours"
                  type="number"
                  placeholder="Exam Hours"
                  onChange={handleChange}
                  className="input-field"
                  required
                />

                <div className="col-span-2 space-y-4 mt-4">
                  <label className="font-semibold text-slate-700">
                    Course Objectives
                  </label>
                  <textarea
                    name="courseObjectives"
                    rows="4"
                    onChange={handleChange}
                    className="input-area"
                    placeholder="Enter objectives..."
                    required
                  ></textarea>
                </div>
                <div className="col-span-2 space-y-4">
                  <label className="font-semibold text-slate-700">
                    Teaching-Learning Process
                  </label>
                  <textarea
                    name="teachingLearningProcess"
                    rows="4"
                    onChange={handleChange}
                    className="input-area"
                    placeholder="Enter process..."
                    required
                  ></textarea>
                </div>
              </div>
            )}

            {/* --- TAB 2: MODULES --- */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                {formData.modules.map((mod, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative"
                  >
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                        Module {index + 1}
                      </span>
                      {formData.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4 mt-6">
                      <textarea
                        placeholder="Module Description / Content"
                        rows="4"
                        value={mod.description}
                        onChange={(e) =>
                          handleModuleChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="input-area"
                        required
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          placeholder="Text Book Ref (e.g. 1, 2)"
                          value={mod.textBookRef}
                          onChange={(e) =>
                            handleModuleChange(
                              index,
                              "textBookRef",
                              e.target.value
                            )
                          }
                          className="input-field"
                          required
                        />
                        <input
                          placeholder="Chapter (e.g. 1.2, 3.4)"
                          value={mod.chapter}
                          onChange={(e) =>
                            handleModuleChange(index, "chapter", e.target.value)
                          }
                          className="input-field"
                          required
                        />
                        <input
                          placeholder="RBT Level (e.g. L1, L2)"
                          value={mod.rbt}
                          onChange={(e) =>
                            handleModuleChange(index, "rbt", e.target.value)
                          }
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addModule}
                  className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-500 rounded-xl hover:bg-blue-50 transition-colors flex justify-center items-center gap-2"
                >
                  <Plus size={20} /> Add Another Module
                </button>
              </div>
            )}

            {/* --- TAB 3: OUTCOMES & RESOURCES --- */}
            {activeTab === "resources" && (
              <div className="space-y-8">
                {/* Course Outcomes */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800">
                    Course Outcomes
                  </h3>
                  {formData.courseOutcomes.map((co, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="py-2 text-slate-400 font-mono text-sm">
                        CO{index + 1}
                      </span>
                      <input
                        value={co}
                        onChange={(e) =>
                          handleOutcomeChange(index, e.target.value)
                        }
                        className="input-field flex-1"
                        placeholder="Enter outcome description..."
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Outcome
                  </button>
                </div>

                <div className="h-px bg-slate-200"></div>

                {/* Textbooks */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-800">
                    Textbooks
                  </h3>
                  {formData.textBooks.map((book, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-slate-200 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeTextBook(index)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                        <input
                          placeholder="Author"
                          value={book.author}
                          onChange={(e) =>
                            handleTextBookChange(
                              index,
                              "author",
                              e.target.value
                            )
                          }
                          className="input-field"
                          required
                        />
                        <input
                          placeholder="Title"
                          value={book.title}
                          onChange={(e) =>
                            handleTextBookChange(index, "title", e.target.value)
                          }
                          className="input-field"
                          required
                        />
                        <input
                          placeholder="Publisher"
                          value={book.publisher}
                          onChange={(e) =>
                            handleTextBookChange(
                              index,
                              "publisher",
                              e.target.value
                            )
                          }
                          className="input-field"
                          required
                        />
                        <input
                          placeholder="Edition/Year"
                          value={book.editionYear}
                          onChange={(e) =>
                            handleTextBookChange(
                              index,
                              "editionYear",
                              e.target.value
                            )
                          }
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTextBook}
                    className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Textbook
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createForm" // Links button to form
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} /> Save Syllabus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
