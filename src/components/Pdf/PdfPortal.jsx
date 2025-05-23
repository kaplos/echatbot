import { createPortal } from 'react-dom';

export default function PDFPortal({ children }) {
  const pdfRoot = document.getElementById('pdf-root');
  return pdfRoot ? createPortal(children, pdfRoot) : null;
}