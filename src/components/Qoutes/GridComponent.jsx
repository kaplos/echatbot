import React, { useState } from "react";
import {Link } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf,faFileExcel } from '@fortawesome/free-solid-svg-icons'
import EditableCell from "./EditableCell";
import { useNavigate } from "react-router-dom";

const EditableGrid = ({ quotes, setQuotes }) => {
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState(null);
  const [formData,setFormData] =useState();
  // Handle cell value change
  const handleChange = (rowId, field, value) => {
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
  const ascendingQuotesByDate = [...quotes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const ascendingQuotesById = [...quotes].sort((a, b) => a.id<b.id ? -1 : 1);
  return (
    <div className="overflow-auto max-h-[600px] border border-gray-300">
        <table className="w-full border-collapse border border-gray-300 table-fixed">
        <thead className="bg-gray-200 sticky top-0 z-10">
            <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2 w-20">Quote Date</th>
                <th className="border border-gray-300 p-2 w-20">Quote Number</th>
                <th className="border border-gray-300 p-2 w-20">Quote Total</th>
                <th className="border border-gray-300 p-2 w-20">Prepared By</th>
                <th className="border border-gray-300 p-2 w-20">For</th>
                <th className="border border-gray-300 p-2 w-20">Customer Ref / Labels</th>
                <th className="border border-gray-300 p-2 w-20">Status</th>
                <th className="border border-gray-300 p-2 w-20">Actions</th>
            </tr>
        </thead>
        <tbody>
            {
                ascendingQuotesById.map((row,index) =>{
                    return(
                        <tr key={index}>
                            <td className="border border-gray-300 p-2 text-center">
                                <span className="flex flex-col">
                                {new Date(row.created_at).toLocaleDateString()}
                                <div className="flex flex-row  gap-2">
                                    <button onClick={()=> handleEditQuote(row.quoteNumber)} className="flex-1 bg-orange-500 text-white px-2 py-1 rounded-md text-sm">Edit </button>
                                    <button onClick={()=> handleViewQuote(row.quoteNumber)} className="flex-1 bg-green-500 text-white px-2 py-1 rounded-md text-sm">View </button>
                                </div>
                                </span>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">{row.id}</td>
                            <td className="border border-gray-300 p-2 text-center">{row.total}</td>
                            <td className="border border-gray-300 p-2 text-center">{row.agent}</td>
                            <td className="border border-gray-300 p-2 text-center">{row.buyer}</td>
                            {/* <td className="border border-gray-300 p-2 text-center">{row.tags}</td> */}
                            {/* <td
                                className="border border-gray-300 p-2 text-center cursor-pointer"
                                onClick={() => setEditingCell({ index, field: "tags" })}
                            >
                                {editingCell?.index === index && editingCell.field === "tags" ? (
                                    <input
                                    type="text"
                                    value={row.tags}
                                    onChange={(e) => handleChange(index, "tags", e.target.value)}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                                    className="border border-gray-300 p-1 w-full text-center"
                                    autoFocus
                                    />
                                ) : (
                                    row.tags || "Click to edit"
                                )}
                            </td> */}
                            <EditableCell
                                handleChange={handleChange}
                                setEditingCell={setEditingCell}
                                editingCell={editingCell}
                                row={row}
                                index={index}
                                cellType={'tags'}
                            />
                            <EditableCell
                                handleChange={handleChange}
                                setEditingCell={setEditingCell}
                                editingCell={editingCell}
                                row={row}
                                index={index}
                                cellType={'status'}
                            />
                        {/* <td
                            className="border border-gray-300 p-2 text-center cursor-pointer"
                            onClick={() => setEditingCell({ index, field: "status" })}
                        >
                            {editingCell?.index === index && editingCell.field === "status" ? (
                                <select
                                value={row.status}
                                onChange={(e) => handleChange(index, "status", e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                className="border border-gray-300 p-1 w-full text-center"
                                autoFocus
                                >
                                <option value="Sent">Sent</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                </select>
                            ) : (
                                row.status || "Click to edit"
                            )}
                        </td> */}
                        <td className="border border-gray-300 p-2 text-center">
                            <div className="flex w-full h-full justify-around">
                                <div onClick={()=> ''} className="cursor-pointer">
                                    <Link />
                                </div>
                                <div onClick={()=> ''} className="cursor-pointer">
                                    <FontAwesomeIcon icon={faFilePdf} size='lg'/>
                                </div>
                                <div onClick={()=> ''} className="cursor-pointer">
                                    <FontAwesomeIcon icon={faFileExcel} size='lg'/>
                                </div>
                            </div>
                        </td>
                    </tr>
                    )
                })
            }
        
        </tbody>
        </table>
    </div>

   
  );
};

export default EditableGrid;
