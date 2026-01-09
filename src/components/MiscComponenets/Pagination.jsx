import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect,useRef, useState } from "react";

export default function Pagination({loading,hasMore,children}) {
    const [searchParams, setSearchParams] = useSearchParams(); 
    const [inputPage, setInputPage] = useState(searchParams.get("page") || "0", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);
  
    useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = parseInt(inputPage);

      if (!isNaN(parsed)) {
        handlePageChange(parsed - 1);
      }
    }, 500);

    return () => clearTimeout(timeout);

  }, [inputPage]);

    const handlePageChange = (newPage) => {
        if (newPage < 0 || (newPage > page && !hasMore)) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", newPage);

        setSearchParams(newParams);
      };
    return (
        <div className="">
          {children}
          <div className="flex justify-between items-center p-2 mt-4">
            <button
              className={`btn px-4 py-2 rounded  ${page === 0 || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0 || loading}
            >
              Previous
            </button>
            <span className="mx-4">Page {page + 1}</span>
            <button
              className={`btn px-4 py-2 rounded  ${!hasMore || loading ? "bg-gray-600 opacity-50 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasMore || loading}
            >
              Next
            </button>
          </div>
        </div>
    )
}