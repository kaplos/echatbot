import { useSearchParams, useNavigate } from "react-router-dom"; // Import React Router hooks


export default function Pagination({loading,hasMore,children}) {
    const [searchParams, setSearchParams] = useSearchParams(); // React Router hook for query params
    const page = parseInt(searchParams.get("page") || "0", 10);

    const handlePageChange = (newPage) => {
        if (newPage < 0 || (newPage > page && !hasMore)) return; // Prevent invalid page navigation
        // setPage(newPage);
        setSearchParams({ page: newPage }); // Update the URL with the new page number
    
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