import React, { useState } from "react";
import { X, FileJson, FileText, File } from "lucide-react";
import { jsPDF } from "jspdf"; // Named import is safer
import autoTable from "jspdf-autotable"; // Import as variable
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
  Header,
  Footer,
  ImageRun,
  AlignmentType,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";

const ViewModal = ({ syllabus, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!syllabus) return null;

  // --- DOWNLOAD: JSON ---
  const downloadJSON = () => {
    const dataStr = JSON.stringify(syllabus, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    saveAs(blob, `${syllabus.courseCode}_syllabus.json`);
  };

  // --- DOWNLOAD: PDF (FIXED) ---
  const downloadPDF = async () => {
    try {
      setLoading(true);
      const doc = new jsPDF();

      // 1. Fetch Logo for PDF
      let logoData = null;
      try {
        const response = await fetch("/university-logo.png");
        if (response.ok) {
          const blob = await response.blob();
          // Convert blob to base64 for jsPDF
          logoData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn("Logo loading failed for PDF", e);
      }

      // 2. Header
      if (logoData) {
        doc.addImage(logoData, "PNG", 95, 5, 20, 20); // Centered Logo
      }

      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(0, 100, 0); // Green color
      doc.text("BANGALORE INSTITUTE OF TECHNOLOGY", 105, 30, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black
      doc.text("Autonomous Institute, Affiliated to VTU, Belgaum", 105, 35, {
        align: "center",
      });

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 0, 0); // Red line
      doc.line(14, 38, 196, 38);

      // 3. Basic Info Table
      const basicInfo = [
        ["Semester", syllabus.semester],
        ["Course Title", syllabus.courseTitle],
        ["Course Code", syllabus.courseCode],
        ["Credits", syllabus.credits],
        ["Total Hours", syllabus.totalHours],
        ["L:T:P:S", syllabus.ltps],
        ["CIE / SEE", `${syllabus.cie} / ${syllabus.see}`],
        ["Exam Hours", `${syllabus.examHours} Hrs`],
      ];

      autoTable(doc, {
        startY: 45,
        body: basicInfo,
        theme: "grid",
        styles: {
          font: "times",
          fontSize: 10,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        },
      });

      let finalY = doc.lastAutoTable.finalY + 8;

      // 4. Objectives
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text("Course Objectives:", 14, finalY);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const splitObj = doc.splitTextToSize(syllabus.courseObjectives, 182);

      // Draw Box for Objectives
      const boxHeight = splitObj.length * 5 + 6;
      doc.rect(14, finalY + 2, 182, boxHeight);
      doc.text(splitObj, 16, finalY + 7);

      finalY += boxHeight + 10;

      // 5. Modules
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text("Modules", 14, finalY);

      const moduleRows = syllabus.modules.map((mod) => [
        `Module ${mod.moduleNo}`,
        `${mod.description}\n\n(Ref: ${mod.textBookRef}, Chap: ${mod.chapter}, RBT: ${mod.rbt})`,
      ]);

      autoTable(doc, {
        startY: finalY + 2,
        head: [["Module", "Description"]],
        body: moduleRows,
        theme: "grid",
        styles: {
          font: "times",
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: "bold" },
        },
      });

      // 6. Outcomes
      finalY = doc.lastAutoTable.finalY + 10;
      doc.text("Course Outcomes", 14, finalY);

      const coRows = syllabus.courseOutcomes.map((co, i) => [`CO${i + 1}`, co]);

      autoTable(doc, {
        startY: finalY + 2,
        head: [["Sl. No", "Course Outcomes"]],
        body: coRows,
        theme: "grid",
        styles: {
          font: "times",
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: 0,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          lineWidth: 0.1,
          lineColor: 0,
        },
        columnStyles: { 0: { cellWidth: 20, fontStyle: "bold" } },
      });

      // 7. Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.text(
        "K.R. Road, V. V. Pura, Bengaluru - 560 004",
        105,
        pageHeight - 15,
        { align: "center" }
      );
      doc.text(
        "Website: www.bit-bangalore.edu.in | Email: principal@bit-bangalore.edu.in",
        105,
        pageHeight - 10,
        { align: "center" }
      );

      doc.save(`${syllabus.courseCode}_Syllabus.pdf`);
      setLoading(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Check console for details.");
      setLoading(false);
    }
  };

  // --- DOWNLOAD: WORD (DOCX) ---
  const downloadWord = async () => {
    setLoading(true);
    // Table Borders Config (Black Single Line)
    const tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    };

    // Cell Helper
    const cell = (text, bold = false, widthPercent = 50, shading = "") =>
      new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        shading: shading ? { fill: shading } : undefined,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: text ? text.toString() : "",
                bold: bold,
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      });

    // 1. Basic Info Rows
    const basicInfoData = [
      ["Semester", syllabus.semester],
      ["Course Title", syllabus.courseTitle],
      ["Course Code", syllabus.courseCode],
      ["Credits", syllabus.credits],
      ["Total Hours of Pedagogy", syllabus.totalHours],
      ["L-T-P-S", syllabus.ltps],
      ["CIE", syllabus.cie],
      ["SEE", syllabus.see],
      ["TOTAL", syllabus.totalMarks],
      ["Exam Type", syllabus.examType],
      ["Exam Hours", syllabus.examHours],
    ];

    const basicInfoRows = basicInfoData.map(
      ([label, value]) =>
        new TableRow({
          children: [cell(label, true, 30), cell(value, false, 70)],
        })
    );

    // 2. Modules Rows
    const moduleRows = syllabus.modules.map(
      (mod) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Module ${mod.moduleNo}`,
                      bold: true,
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: mod.description,
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
            cell(mod.chapter, false, 10),
            cell(mod.rbt, false, 10),
          ],
        })
    );

    // 3. Outcomes Rows
    const coRows = syllabus.courseOutcomes.map(
      (co, i) =>
        new TableRow({
          children: [cell((i + 1).toString(), false, 10), cell(co, false, 90)],
        })
    );

    // 4. Books Rows
    const bookRows = syllabus.textBooks.map(
      (book) =>
        new TableRow({
          children: [
            cell(book.slNo.toString(), false, 5),
            cell(book.author, false, 25),
            cell(book.title, false, 30),
            cell(book.publisher, false, 25),
            cell(book.editionYear, false, 15),
          ],
        })
    );

    // Fetch Image
    let imageBuffer = null;
    try {
      const response = await fetch("/university-logo.png");
      if (response.ok) {
        const blob = await response.blob();
        imageBuffer = await blob.arrayBuffer();
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      console.warn("Logo not found");
    }

    const doc = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                imageBuffer
                  ? new Paragraph({
                      children: [
                        new ImageRun({
                          data: imageBuffer,
                          transformation: { width: 60, height: 60 },
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    })
                  : new Paragraph({ text: "" }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "BANGALORE INSTITUTE OF TECHNOLOGY",
                      bold: true,
                      size: 28,
                      color: "006400",
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Autonomous Institute, Affiliated to VTU, Belgaum",
                      size: 20,
                      color: "2E75B6",
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "________________________________________________________________________________",
                      bold: true,
                      color: "FF0000",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "K.R. Road, V. V. Pura, Bengaluru – 560 004",
                      size: 18,
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Phone: +91(080) 26613237, 26615865 | Website: www.bit-bangalore.edu.in",
                      size: 18,
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "E-mail : principalbit4@gmail.com, principal@bit-bangalore.edu.in",
                      size: 18,
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Accredited by NBA: 9 UG Programs, NAAC A+ and QS-I Gauge (Gold Rating)",
                      size: 18,
                      font: "Times New Roman",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children: [
            new Table({
              rows: basicInfoRows,
              borders: tableBorders,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ text: "" }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Course objectives: This course will enable the students to:",
                  bold: true,
                  font: "Times New Roman",
                }),
              ],
              border: {
                top: { style: BorderStyle.SINGLE },
                bottom: { style: BorderStyle.SINGLE },
                left: { style: BorderStyle.SINGLE },
                right: { style: BorderStyle.SINGLE },
              },
              spacing: { before: 200, after: 200 },
              indent: { left: 100, right: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: syllabus.courseObjectives,
                  font: "Times New Roman",
                }),
              ],
            }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "Modules", heading: "Heading3" }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    cell("Module", true, 20),
                    cell("Description", true, 60),
                    cell("Chapter", true, 10),
                    cell("RBT", true, 10),
                  ],
                }),
                ...moduleRows,
              ],
              borders: tableBorders,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "Course Outcomes", heading: "Heading3" }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    cell("Sl. No", true, 10),
                    cell("Course Outcomes", true, 90),
                  ],
                }),
                ...coRows,
              ],
              borders: tableBorders,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "Text Books", heading: "Heading3" }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    cell("No", true, 5),
                    cell("Author", true, 25),
                    cell("Title", true, 30),
                    cell("Publisher", true, 25),
                    cell("Year", true, 15),
                  ],
                }),
                ...bookRows,
              ],
              borders: tableBorders,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${syllabus.courseCode}_Syllabus.docx`);
      setLoading(false);
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
                disabled={loading}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1 disabled:opacity-50"
              >
                <FileJson size={20} /> JSON
              </button>
              <button
                onClick={downloadPDF}
                disabled={loading}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1 disabled:opacity-50"
              >
                <FileText size={20} /> {loading ? "..." : "PDF"}
              </button>
              <button
                onClick={downloadWord}
                disabled={loading}
                className="p-2 text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center text-[10px] gap-1 disabled:opacity-50"
              >
                <File size={20} /> {loading ? "..." : "DOCX"}
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

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-white font-serif">
          <div className="max-w-3xl mx-auto space-y-8 text-slate-800">
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
              <h1 className="text-2xl font-bold text-green-800">
                BANGALORE INSTITUTE OF TECHNOLOGY
              </h1>
              <p className="text-blue-700 font-semibold">
                Autonomous Institute, Affiliated to VTU, Belgaum
              </p>
            </div>

            {/* Basic Info Table */}
            <table className="w-full border-collapse border border-black mb-8 text-sm">
              <tbody>
                {[
                  ["Semester", syllabus.semester],
                  ["Course Title", syllabus.courseTitle],
                  ["Course Code", syllabus.courseCode],
                  ["Credits", syllabus.credits],
                  ["Total Hours", syllabus.totalHours],
                  ["L:T:P:S", syllabus.ltps],
                  ["Exam Type", syllabus.examType],
                  ["Exam Hours", syllabus.examHours],
                  ["CIE", syllabus.cie],
                  ["SEE", syllabus.see],
                  ["Total", syllabus.totalMarks],
                ].map(([label, val], i) => (
                  <tr key={i} className="border-b border-black">
                    <td className="border-r border-black p-2 font-bold bg-slate-100 w-1/3">
                      {label}
                    </td>
                    <td className="p-2">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Objectives */}
            <div className="border border-black p-4 mb-8">
              <h3 className="font-bold mb-2">Course Objectives:</h3>
              <p className="whitespace-pre-wrap">{syllabus.courseObjectives}</p>
            </div>

            {/* Modules */}
            <h3 className="text-xl font-bold mb-4">Modules</h3>
            <div className="space-y-4">
              {syllabus.modules.map((mod, i) => (
                <div key={i} className="border border-black p-4">
                  <div className="flex justify-between font-bold border-b border-black pb-2 mb-2 bg-slate-50 p-2">
                    <span>Module {mod.moduleNo}</span>
                    <span>RBT: {mod.rbt}</span>
                  </div>
                  <p className="whitespace-pre-wrap p-2">{mod.description}</p>
                  <div className="text-sm mt-2 italic border-t border-slate-300 pt-2 p-2">
                    Ref: {mod.textBookRef}, Chap: {mod.chapter}
                  </div>
                </div>
              ))}
            </div>

            {/* Outcomes */}
            <h3 className="text-xl font-bold mb-4 mt-8">Course Outcomes</h3>
            <table className="w-full border border-black text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-black">
                  <th className="border-r border-black p-2 w-16">Sl. No</th>
                  <th className="p-2 text-left">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {syllabus.courseOutcomes.map((co, i) => (
                  <tr key={i} className="border-b border-black">
                    <td className="border-r border-black p-2 text-center">
                      {i + 1}
                    </td>
                    <td className="p-2">{co}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
