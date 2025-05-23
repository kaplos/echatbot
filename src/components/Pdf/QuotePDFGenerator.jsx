import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import ViewQuote from '../../Pages/ViewQuote';
import PDFPortal from './PdfPortal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

export default function QuotePDFGenerator({quoteNumber, quoteId}) {
  const quoteRef = useRef();
  const [renderQuote, setRenderQuote] = useState(false);

  const handleDownloadPDF = () => {
    setRenderQuote(true);
    setTimeout(() => {
      if (quoteRef.current) {
        html2pdf()
          .set({
            filename: `quote${quoteId}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          })
          .from(quoteRef.current)
          .save()
          .then(() => setRenderQuote(false));
      }
    }, 500);
  };

  return (
    <>
      <button onClick={handleDownloadPDF}><FontAwesomeIcon icon={faFilePdf} size="lg" className='hover:text-blue-700'/></button>

      {renderQuote && (
        <PDFPortal>
          <div ref={quoteRef}>
            <ViewQuote quoteId={quoteNumber} forPdf />
          </div>
        </PDFPortal>
      )}
    </>
  );
}
