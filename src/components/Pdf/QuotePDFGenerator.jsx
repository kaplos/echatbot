import { useRef, useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import ViewQuote from '../../Pages/ViewQuote';
import PDFPortal from './PdfPortal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

export default function QuotePDFGenerator({ quoteNumber, quoteId }) {
  const quoteRef = useRef();
  const [renderQuote, setRenderQuote] = useState(false);
  const viewQuoteReadyRef = useRef(null);

  const waitForImagesToLoad = (container) => {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          console.log(`Attempting to load image: ${img.src}`);
          if (img.complete) {
            console.log(`Image loaded successfully: ${img.src}`);
            resolve();
          } else {
            img.onload = () => {
              console.log(`Image loaded successfully: ${img.src}`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Error loading image: ${img.src}`);
              resolve();
            };
          }
        })
    );
    return Promise.all(promises);
  };

  const handleViewQuoteReady = useCallback(() => {
    console.log('ViewQuote is ready!');
    if (viewQuoteReadyRef.current) {
      viewQuoteReadyRef.current();
    }
  }, []);

  const handleDownloadPDF = async () => {
    setRenderQuote(true);
    
    // Create a new promise for each PDF generation
    const viewQuoteReady = new Promise((resolve) => {
      viewQuoteReadyRef.current = resolve;
    });
    
    try {
      console.log('Waiting for ViewQuote to be ready...');
      // Wait for ViewQuote to signal it's ready
      await viewQuoteReady;
      console.log('ViewQuote is ready, proceeding with PDF generation...');
      
      if (quoteRef.current) {
        // Wait for all images to load
        await waitForImagesToLoad(quoteRef.current);
        
        console.log(quoteRef.current.innerHTML);
        
        const pdfOptions = {
          filename: `quote${quoteId}.pdf`,
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait',
          },
        };
        
        const pdf = html2pdf()
          .set(pdfOptions)
          .from(quoteRef.current);
  
        const blob = await pdf.outputPdf('blob');
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setRenderQuote(false);
      viewQuoteReadyRef.current = null;
    }
  };
  
  return (
    <>
      <button onClick={handleDownloadPDF}>
        <FontAwesomeIcon icon={faFilePdf} size="lg" className="hover:text-blue-700" />
      </button>

      {renderQuote && (
        <PDFPortal>
          <div ref={quoteRef}>
            <ViewQuote 
              quoteId={quoteNumber} 
              forPdf={true} 
              resolve={handleViewQuoteReady}
            />
          </div>
        </PDFPortal>
      )}
    </>
  );
}