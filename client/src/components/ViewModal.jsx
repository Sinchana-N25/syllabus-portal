import React from "react";
import { X, FileJson, FileText, File } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable"; // This import is crucial for PDF tables
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
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 100, 0); // Green color for BIT
    doc.text("BANGALORE INSTITUTE OF TECHNOLOGY", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Autonomous Institute, Affiliated to VTU, Belgaum", 105, 20, {
      align: "center",
    });
    doc.line(10, 22, 200, 22); // Horizontal line

    // Basic Info Table (Vertical Layout like screenshot)
    const basicInfo = [
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

    doc.autoTable({
      startY: 30,
      body: basicInfo,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    });

    let finalY = doc.lastAutoTable.finalY + 5;

    // Objectives Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Course objectives: This course will enable the students to:",
      14,
      finalY
    );

    // Split text for wrapping
    doc.setFont("helvetica", "normal");
    const splitObj = doc.splitTextToSize(syllabus.courseObjectives, 180);
    doc.rect(14, finalY + 2, 182, splitObj.length * 5 + 4); // Box
    doc.text(splitObj, 16, finalY + 7);

    finalY += splitObj.length * 5 + 10;

    // Modules
    const moduleRows = syllabus.modules.map((mod) => [
      `Module ${mod.moduleNo}`,
      `${mod.description}\n\n(Ref: ${mod.textBookRef}, Chap: ${mod.chapter}, RBT: ${mod.rbt})`,
    ]);

    doc.autoTable({
      startY: finalY,
      head: [["Module", "Description"]],
      body: moduleRows,
      theme: "grid",
      styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    // Outcomes
    finalY = doc.lastAutoTable.finalY + 10;
    const coRows = syllabus.courseOutcomes.map((co, i) => [`CO${i + 1}`, co]);

    doc.text("Course Outcomes:", 14, finalY);
    doc.autoTable({
      startY: finalY + 2,
      head: [["Sl. No", "Course Outcomes"]],
      body: coRows,
      theme: "grid",
      styles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
      },
      columnStyles: { 0: { cellWidth: 20 } },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(
      "K.R. Road, V. V. Pura, Bengaluru - 560 004",
      105,
      pageHeight - 15,
      { align: "center" }
    );
    doc.text("Website: www.bit-bangalore.edu.in", 105, pageHeight - 11, {
      align: "center",
    });

    doc.save(`${syllabus.courseCode}_Syllabus.pdf`);
  };

  // --- DOWNLOAD: WORD (DOCX) - EXACT FORMATTING ---
  const downloadWord = async () => {
    // Helper for table borders (Black single line)
    const tableBorders = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    };

    // Helper for table cells
    const cell = (text, bold = false, widthPercent = 50) =>
      new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: text.toString(),
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
          children: [cell(label, false, 30), cell(value, true, 70)],
        })
    );

    // 2. Modules Rows
    const moduleRows = syllabus.modules.map(
      (mod) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: `Module ${mod.moduleNo}`, bold: true }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(mod.description)],
              width: { size: 60, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(mod.chapter)],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph(mod.rbt)],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
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
            cell(book.slNo.toString(), false, 10),
            cell(book.author, false, 30),
            cell(book.title, false, 30),
            cell(book.publisher, false, 20),
            cell(book.editionYear, false, 10),
          ],
        })
    );

    // FETCH IMAGE
    let imageBuffer = null;
    try {
      const response = await fetch("/university-logo.png"); // Expects file in public folder
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
                  : new Paragraph({
                      text: "[LOGO]",
                      alignment: AlignmentType.CENTER,
                    }),
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
            // BASIC INFO TABLE
            new Table({
              rows: basicInfoRows,
              borders: tableBorders,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ text: "" }),

            // OBJECTIVES
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
              text: syllabus.courseObjectives,
              font: "Times New Roman",
            }),
            new Paragraph({ text: "" }),

            // MODULES
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

            // OUTCOMES
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

            // BOOKS
            new Paragraph({ text: "Text Books", heading: "Heading3" }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    cell("No", true, 10),
                    cell("Author", true, 30),
                    cell("Title", true, 30),
                    cell("Publisher", true, 20),
                    cell("Year", true, 10),
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

            <table className="w-full border-collapse border border-black mb-8">
              <tbody>
                {[
                  ["Semester", syllabus.semester],
                  ["Course Title", syllabus.courseTitle],
                  ["Course Code", syllabus.courseCode],
                  ["Credits", syllabus.credits],
                  ["L:T:P:S", syllabus.ltps],
                  ["Exam Hours", syllabus.examHours],
                  ["CIE / SEE", `${syllabus.cie} / ${syllabus.see}`],
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

            <div className="border border-black p-4 mb-8">
              <h3 className="font-bold mb-2">Course Objectives:</h3>
              <p className="whitespace-pre-wrap">{syllabus.courseObjectives}</p>
            </div>

            <h3 className="text-xl font-bold mb-4">Modules</h3>
            <div className="space-y-4">
              {syllabus.modules.map((mod, i) => (
                <div key={i} className="border border-black p-4">
                  <div className="flex justify-between font-bold border-b border-black pb-2 mb-2">
                    <span>Module {mod.moduleNo}</span>
                    <span>RBT: {mod.rbt}</span>
                  </div>
                  <p>{mod.description}</p>
                  <p className="text-sm mt-2 italic">
                    Ref: {mod.textBookRef}, Chap: {mod.chapter}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
