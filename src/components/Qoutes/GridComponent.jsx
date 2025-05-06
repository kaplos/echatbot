import React, { useState, useEffect } from "react";
import { Link } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import EditableCell from "./EditableCell";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "../SupaBaseProvider";

const EditableGrid = ({ quotes, setQuotes }) => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const [editingCell, setEditingCell] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [copiedRowId, setCopiedRowId] = useState(null); // State to track which row was copied

  useEffect(() => {
    fetchQuotes(0);
  }, []);

  // Handle cell value change
  const handleChange = (rowId, field, value) => {
    const { data, error } = supabase
      .from("quotes")
      .update({ [field]: value })
      .eq("id", rowId);

    if (error) {
      console.error("Error updating quote:", error);
    }
    // console.log(rowId,field,value,'rowId,field,value')
    const updatedData = [...quotes];
    const index = updatedData.findIndex((item) => item.id === rowId);
    // console.log(updatedData,'updated data')

    updatedData[index][field] = value;
    setQuotes(updatedData);
  };

  const handleEditQuote = (quoteNumber) => {
    navigate(`/newQuote?quote=${quoteNumber}`);
  };
  const handleViewQuote = (quoteNumber) => {
    navigate(`/viewQuote?quote=${quoteNumber}`);
  };
  const PAGE_SIZE = 20;

  const handleCopyToClipboard = (quoteNumber, rowId) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/viewQuote?quote=${quoteNumber}`
    );
    setCopiedRowId(rowId); // Set the copied row ID
    setTimeout(() => setCopiedRowId(null), 2000); // Reset after 2 seconds
  };

  const fetchQuotes = async (pageNumber) => {
    setLoading(true);
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("quotes")
      .select(
        `
      * 
    `
      )
      .order("created_at", { ascending: true }) // or by ID
      .range(from, to);

    if (error) {
      console.error("Error fetching quotes:", error);
      setLoading(false);
      return;
    }

    if (data.length < PAGE_SIZE) setHasMore(false);

    setQuotes([...quotes, ...data]);
    setPage(pageNumber + 1);
    setLoading(false);
  };

  const ascendingQuotesByDate = [...quotes].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  const ascendingQuotesById = [...quotes].sort((a, b) =>
    a.id < b.id ? -1 : 1
  );

  return (
    <div
      className="overflow-auto max-h-[600px] border border-gray-300"
      onScroll={(e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const nearBottom = scrollHeight - scrollTop <= clientHeight + 50;

        if (nearBottom && !loading && hasMore) {
          fetchQuotes(page);
        }
      }}
    >
      <table className="w-full border-collapse border border-gray-300 table-sticky">
        <thead className="bg-gray-200 sticky top-0 z-10">
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 w-20">Quote Date</th>
            <th className="border border-gray-300 p-2 w-20">Quote Number</th>
            <th className="border border-gray-300 p-2 w-20">Quote Total</th>
            <th className="border border-gray-300 p-2 w-20">Prepared By</th>
            <th className="border border-gray-300 p-2 w-20">For</th>
            <th className="border border-gray-300 p-2 w-20">
              Customer Ref / Labels
            </th>
            <th className="border border-gray-300 p-2 w-20">Status</th>
            <th className="border border-gray-300 p-2 w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ascendingQuotesById.map((row, index) => {
            return (
              <tr key={index}>
                <td className="border border-gray-300 p-2 text-center">
                  <span className="flex flex-col">
                    {new Date(row.created_at).toLocaleDateString()}
                    <div className="flex flex-row  gap-2">
                      <button
                        onClick={() => handleEditQuote(row.quoteNumber)}
                        className="flex-1 bg-green-500 text-white px-2 py-1 rounded-md text-sm"
                      >
                        Edit/View{" "}
                      </button>
                      {/* <button onClick={()=> handleViewQuote(row.quoteNumber)} className="flex-1 bg-green-500 text-white px-2 py-1 rounded-md text-sm">View </button> */}
                    </div>
                  </span>
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {row.id}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  ${row.quoteTotal}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {row.agent}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {row.buyer}
                </td>
                <EditableCell
                  handleChange={handleChange}
                  setEditingCell={setEditingCell}
                  editingCell={editingCell}
                  row={row}
                  index={index}
                  cellType={"tags"}
                />
                <EditableCell
                  handleChange={handleChange}
                  setEditingCell={setEditingCell}
                  editingCell={editingCell}
                  row={row}
                  index={index}
                  cellType={"status"}
                />
                <td className="border border-gray-300 p-2 text-center">
                  <div className="flex w-full h-full justify-around">
                    <div className="relative group z-5">
                      {/* Label for Copy to Clipboard */}
                      {copiedRowId === row.id ? (
                        <label
                          htmlFor=""
                          className="absolute z-40 bottom-full mb-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded-md shadow-md"
                        >
                          Copied to clipboard
                        </label>
                      ) : (
                        <label
                          htmlFor=""
                          className="absolute z-40 bottom-full mb-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 bg-white px-2 py-1 rounded-md hidden group-hover:block"
                        >
                          Copy to clipboard
                        </label>
                      )}
                      {/* Clickable Icon */}
                      <div
                        onClick={() =>
                          handleCopyToClipboard(row.quoteNumber, row.id)
                        }
                        className="cursor-pointer z-0"
                        aria-label="Copy link to clipboard"
                      >
                        <Link className="text-black hover:text-blue-700" />
                      </div>
                    </div>
                    <div onClick={() => ""} className="cursor-pointer">
                      <FontAwesomeIcon icon={faFilePdf} size="lg" />
                    </div>
                    <div onClick={() => ""} className="cursor-pointer">
                      <FontAwesomeIcon icon={faFileExcel} size="lg" />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EditableGrid;
