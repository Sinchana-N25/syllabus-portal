import React from "react";
import { X, Download, FileJson, FileText, File } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

const ViewModal = ({ syllabus, onClose }) => {
  if (!syllabus) return null;

  // --- DOWNLOAD: JSON ---
  const downloadJSON = () => {
    const dataStr = JSON.stringify(syllabus, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    saveAs(blob, `${syllabus.courseCode}_syllabus.json`);
  };

  // --- DOWNLOAD: PDF ---
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("BANGALORE INSTITUTE OF TECHNOLOGY", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Department of Computer Science & Engineering", 105, 22, {
      align: "center",
    });

    // Course Details Table
    doc.autoTable({
      startY: 30,
      head: [["Semester", "Course Title", "Course Code", "Credits"]],
      body: [
        [
          syllabus.semester,
          syllabus.courseTitle,
          syllabus.courseCode,
          syllabus.credits,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Marks & Hours
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["CIE", "SEE", "Total Marks", "Exam Hours", "L:T:P:S"]],
      body: [
        [
          syllabus.cie,
          syllabus.see,
          syllabus.totalMarks,
          syllabus.examHours,
          syllabus.ltps,
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Objectives
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Course Objectives:", 14, finalY);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    const splitObj = doc.splitTextToSize(syllabus.courseObjectives, 180);
    doc.text(splitObj, 14, finalY + 7);

    // Modules
    finalY = finalY + 10 + splitObj.length * 5;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Modules:", 14, finalY);

    const moduleRows = syllabus.modules.map((mod) => [
      `Module ${mod.moduleNo}`,
      mod.description,
      mod.rbt,
      mod.textBookRef,
    ]);

    doc.autoTable({
      startY: finalY + 5,
      head: [["Module", "Description", "RBT Level", "Ref"]],
      body: moduleRows,
      theme: "grid",
      columnStyles: { 1: { cellWidth: 100 } }, // Make description column wider
    });

    // Outcomes
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Course Outcomes:", 14, finalY);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    syllabus.courseOutcomes.forEach((co, i) => {
      finalY += 6;
      doc.text(`CO${i + 1}: ${co}`, 14, finalY);
    });

    doc.save(`${syllabus.courseCode}_Syllabus.pdf`);
  };

  // --- DOWNLOAD: WORD (DOCX) ---
  const downloadWord = () => {
    // Helper to create table cells
    const createCell = (text) =>
      new TableCell({
        children: [new Paragraph(text)],
        width: { size: 25, type: WidthType.PERCENTAGE },
      });

    // Modules Rows
    const moduleRows = syllabus.modules.map(
      (mod) =>
        new TableRow({
          children: [
            createCell(`Module ${mod.moduleNo}`),
            new TableCell({
              children: [new Paragraph(mod.description)],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            createCell(mod.rbt),
            createCell(mod.textBookRef),
          ],
        })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: "BANGALORE INSTITUTE OF TECHNOLOGY",
              heading: "Heading1",
              alignment: "center",
            }),
            new Paragraph({
              text: "Department of Computer Science & Engineering",
              alignment: "center",
            }),
            new Paragraph({ text: "" }), // Spacing

            // Basic Info
            new Paragraph({
              text: `Course: ${syllabus.courseTitle} (${syllabus.courseCode})`,
              heading: "Heading2",
            }),
            new Paragraph({
              text: `Semester: ${syllabus.semester} | Credits: ${syllabus.credits} | L:T:P:S: ${syllabus.ltps}`,
            }),
            new Paragraph({ text: "" }),

            // Objectives
            new Paragraph({ text: "Course Objectives", heading: "Heading3" }),
            new Paragraph({ text: syllabus.courseObjectives }),
            new Paragraph({ text: "" }),

            // Modules Table
            new Table({
              rows: [
                new TableRow({
                  children: [
                    createCell("Module"),
                    new TableCell({
                      children: [new Paragraph("Description")],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    createCell("RBT Level"),
                    createCell("Ref"),
                  ],
                }),
                ...moduleRows,
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),

            new Paragraph({ text: "" }),

            // Outcomes
            new Paragraph({ text: "Course Outcomes", heading: "Heading3" }),
            ...syllabus.courseOutcomes.map(
              (co, i) =>
                new Paragraph({
                  text: `CO${i + 1}: ${co}`,
                  bullet: { level: 0 },
                })
            ),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${syllabus.courseCode}_Syllabus.docx`);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {syllabus.courseTitle}
            </h2>
            <p className="text-slate-500 font-mono text-sm mt-1">
              {syllabus.courseCode} • Sem {syllabus.semester}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Download Dropdown */}
            <div className="flex gap-2 mr-4">
              <button
                onClick={downloadJSON}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1"
              >
                <FileJson size={20} /> JSON
              </button>
              <button
                onClick={downloadPDF}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1"
              >
                <FileText size={20} /> PDF
              </button>
              <button
                onClick={downloadWord}
                className="p-2 text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1"
              >
                <File size={20} /> DOCX
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable Document View */}
        <div className="flex-1 overflow-y-auto p-8 bg-white font-serif">
          <div className="max-w-3xl mx-auto space-y-8 text-slate-800">
            {/* Top Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-lg border border-slate-100 font-sans">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold">
                  Credits
                </span>
                <p className="font-semibold">{syllabus.credits}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold">
                  Hours
                </span>
                <p className="font-semibold">{syllabus.totalHours}</p>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold">
                  CIE/SEE
                </span>
                <p className="font-semibold">
                  {syllabus.cie} / {syllabus.see}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold">
                  Exam
                </span>
                <p className="font-semibold">{syllabus.examHours} Hrs</p>
              </div>
            </div>

            {/* Objectives */}
            <section>
              <h3 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 text-blue-900 font-sans">
                Course Objectives
              </h3>
              <p className="whitespace-pre-wrap leading-relaxed">
                {syllabus.courseObjectives}
              </p>
            </section>

            {/* Modules */}
            <section>
              <h3 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 text-blue-900 font-sans">
                Modules
              </h3>
              <div className="space-y-6">
                {syllabus.modules.map((mod, i) => (
                  <div key={i} className="pl-4 border-l-4 border-blue-100">
                    <div className="flex justify-between items-baseline mb-2 font-sans">
                      <h4 className="font-bold text-lg text-slate-700">
                        Module {mod.moduleNo}
                      </h4>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                        RBT: {mod.rbt}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap mb-2">
                      {mod.description}
                    </p>
                    <div className="text-sm text-slate-500 italic">
                      Ref Books: {mod.textBookRef} | Chapter: {mod.chapter}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Outcomes */}
            <section>
              <h3 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 text-blue-900 font-sans">
                Course Outcomes
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {syllabus.courseOutcomes.map((co, i) => (
                  <li key={i}>
                    <span className="font-bold font-sans text-sm mr-2">
                      CO{i + 1}:
                    </span>
                    {co}
                  </li>
                ))}
              </ul>
            </section>

            {/* Books */}
            <section>
              <h3 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4 text-blue-900 font-sans">
                Textbooks
              </h3>
              <ul className="list-decimal pl-5 space-y-2">
                {syllabus.textBooks.map((book, i) => (
                  <li key={i}>
                    <span className="font-semibold">{book.title}</span> by{" "}
                    {book.author} — {book.publisher}, {book.editionYear}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
