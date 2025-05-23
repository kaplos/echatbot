import { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import SlideEditor from '../../components/Ideas/SlideEditor';

export default function IdeasExportPDF({ ideas }) {
  const pdfRef = useRef();

  const handleExportPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .set({
          filename: 'exported-ideas.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .from(pdfRef.current)
        .save();
    }
  };

  return (
    <div>
      <button
        onClick={handleExportPDF}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 mb-4"
      >
        Export as PDF
      </button>
      <div ref={pdfRef} style={{ padding: '2rem', width: '8.5in', minHeight: '11in' }}>
        <h1 className="text-black text-2xl font-bold mb-4">Exported Ideas</h1>
        {ideas.map((idea, idx) => (
          <div
            key={idea.id}
            style={{
              marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              pageBreakAfter: 'always', // Ensures each idea starts on a new page
            }}
          >
            <h2 className="text-lg font-semibold mb-2">Idea {idx + 1}</h2>
            <SlideEditor
              initialData={idea.slides}
              readOnly={true} // Ensure the editor is in read-only mode for exporting
            />
          </div>
        ))}
      </div>
    </div>
  );
}
