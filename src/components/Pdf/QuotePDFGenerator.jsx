import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import ViewQuote from '../../Pages/ViewQuote';
import PDFPortal from './PdfPortal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

export default function QuotePDFGenerator({ quoteNumber, quoteId }) {
  const quoteRef = useRef();
  const [renderQuote, setRenderQuote] = useState(false);

  const waitForImagesToLoad = (container) => {
    const images = container.querySelectorAll('img');
    console.log(images)
    const promises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          console.log(`Attempting to load image: ${img.src}`); // Log image URL
          if (img.complete) {
            console.log(`Image loaded successfully: ${img.src}`);
            resolve(); // Image is already loaded
          } else {
            img.onload = () => {
              console.log(`Image loaded successfully: ${img.src}`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Error loading image: ${img.src}`); // Log error
              resolve(); // Resolve even if the image fails to load
            };
          }
        })
    );
    console.log(promises)
    return Promise.all(promises);
  };

  // const handleDownloadPDF = async () => {
  //   setRenderQuote(true);
  //   setTimeout(async () => {
  //     if (quoteRef.current) {
  //       // Wait for all images to load
  //       await waitForImagesToLoad(quoteRef.current);

  //       // Generate the PDF
  //       html2pdf()
  //         .set({
  //           filename: `quote${quoteId}.pdf`,
  //           html2canvas: { scale: 2 },
  //           jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  //         })
  //         .from(quoteRef.current)
  //         .save()
  //         .then(() => setRenderQuote(false));
  //     }
  //   }, 500);
  // };
  const handleDownloadPDF = async () => {
    setRenderQuote(true);
    setTimeout(async () => {
      if (quoteRef.current) {
        // Wait for all images to load
        await waitForImagesToLoad(quoteRef.current);
        await new Promise((resolve) => setTimeout(resolve, 10000));        // Generate the PDF
        console.log(quoteRef.current.innerHTML); // Log the content of the container
        const pdfOptions = {
          filename: `quote${quoteId}.pdf`,
          html2canvas: { scale: 2, useCORS: true, logging: true }, // Enable logging
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        const pdf = html2pdf()
          .set(pdfOptions)
          .from(quoteRef.current);
  
        // Generate the PDF as a Blob
        const blob = await pdf.outputPdf('blob');
  
        // Create a URL for the Blob and open it in a new tab
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank'); // Open the PDF in a new tab
  
        setRenderQuote(false);
      }
    }, 500);
  };
  return (
    <>
      <button onClick={handleDownloadPDF}>
        <FontAwesomeIcon icon={faFilePdf} size="lg" className="hover:text-blue-700" />
      </button>

      {renderQuote && (
        <PDFPortal>
          <div ref={quoteRef}>
          {/* <img src="https://ujwdpieleyuaiammaopj.supabase.co/storage/v1/object/public/echatbot/public/WhatsApp%20Image%202025-05-16%20at%204.07.09%20PM.jpeg" alt="Test Image" /> */}

            <ViewQuote quoteId={quoteNumber} forPdf />
          </div>
        </PDFPortal>
      )}
    </>
  );
}