import { useSearchParams, useNavigate } from "react-router-dom"; // Import React Router hooks
import { useEffect,useRef, useState } from "react";

export default function Pagination({loading,hasMore,children}) {
    const [searchParams, setSearchParams] = useSearchParams(); 
    const [inputPage, setInputPage] = useState(searchParams.get("page") || "0", 10); // React Router hook for query params
    const page = parseInt(searchParams.get("page") || "0", 10);
  
    useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = parseInt(inputPage);

      if (!isNaN(parsed)) {
        handlePageChange(parsed - 1); // convert back to 0-based
      }
    }, 500); // delay in ms

    return () => clearTimeout(timeout); // clear on new input

  }, [inputPage]);

    const handlePageChange = (newPage) => {
        if (newPage < 0 || (newPage > page && !hasMore)) return; // Prevent invalid page navigation
        // setPage(newPage);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage); // Only update 'page'

  setSearchParams(newParams);
        // fetchSamples(newPage);
      };
    return (
        <>
        {children}

        <div className="flex justify-between items-center mt-6">
          <button
            className={`btn p-2 rounded  ${page === 0 || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : " bg-blue-500 text-white hover:bg-blue-600"}`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0 || loading}
          >
            Previous
          </button>
          <span>Page {page + 1}</span>
          {/* <input type="text" value={inputPage + 1||0} onChange={(e) => setInputPage(parseInt(e.target.value) - 1)} className="mx-2 w-12 text-center border border-gray-300 rounded" /> */}
          <button
            className={`btn p-2 rounded hover:bg-blue-600 ${!hasMore || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : " bg-blue-500 text-white"}`}
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || loading}
          >
            Next
          </button>
        </div>
        </>
    )
}