import { useSupabase } from "../components/SupaBaseProvider";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { ChevronDown, X, Upload } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import CustomSelect from "../components/CustomSelect";
import { Plus } from "lucide-react";
import EditableCell from "../components/Qoutes/EditableCell";
import EditableCellWithGenerics from "../components/Qoutes/EditableCellWithGenerics";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useMessage } from "../components/Messages/MessageContext";
import MoreImageModel from "../components/Qoutes/MoreImageModel";
import { getStatusColor } from "../utils/designUtils";

export default function ViewQuote({ quoteId, forPdf }) {
  const navigate = useNavigate();
  const { supabase, session } = useSupabase();
  const isAuthenticated = session || false;
  const location = useLocation();
  const { showMessage } = useMessage();
  const quote =
    new URLSearchParams(location.search).get("quote") || quoteId || null;
  const [formData, setFormData] = useState({
    agent: "",
    buyer: "",
    tags: "",
    status: "",
    gold: 2300,
    silver: 32,
    items: [],
  });
  const [productInfo, setProductInfo] = useState();
  const [lineItems, setlineItems] = useState([]);
  const [isImageModelOpen, setImageModelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [filter, setFilters] = useState();

  useEffect(() => {
    const updateStatusToViewed = async () => {
      if (!isAuthenticated && quote) {
        const { error } = await supabase
          .from("quotes")
          .update({ status: "viewed:yellow" }) // Update the status to "viewed"
          .eq("quoteNumber", quote);

        if (error) {
          console.error("Error updating quote status to viewed:", error);
        } else {
          console.log("Quote status updated to viewed");
        }
      }
    };

    updateStatusToViewed();
  }, [isAuthenticated, quote, supabase]);

  useEffect(() => {
    if (quote) {
      console.log(quote, "quote from params");
      const fetchQuote = async () => {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("quotes")
          .select(
            `
                                    quoteNumber,
                                    agent,
                                    buyer,
                                    tags,
                                    status,
                                    gold,
                                    silver,
                                    lineItems (
                                        id,
                                        productId,
                                        salesPrice,
                                        internalNote,
                                        BuyerComment,
                                        product:productId (
                                            id,
                                            name,
                                            styleNumber,
                                            salesWeight,
                                            startingInfo:starting_info_id (
                                                *
                                            )
                                        )
                                    )
                                `
          )
          .eq("quoteNumber", quote)
          .single();
        const processedLineItems = data.lineItems.map((item) => {
          const { startingInfo, ...productData } = item.product; // Extract startingInfo and product data
          const { id, ...startingInfoData } = startingInfo; // Extract id and other properties from startingInfo
          return {
            ...productData, // Spread the product data into the top-level object
            ...startingInfoData, // Spread the startingInfo data into the top-level object
          };
        }); // delete data.lineItems
        console.log(processedLineItems);
        setlineItems(data.lineItems);
        setProductInfo(processedLineItems);
        console.log(data);

        if (error) {
          console.error("Error fetching samples:", error);
          return;
        }
        // resetForm(data);
        // setProductInfo(data)
        // console.log(data);
        setIsLoading(false);
      };
      fetchQuote();
    } else {
      console.log("not displaying a quote");
    }
  }, [quote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      showMessage("Please add items to the quote", "error");
      return;
    }
    if (quote) {
      updateIfChanged();
    }
    // onSave(formData);
    const { data, error } = await supabase.from("quotes").insert([formData]);
    // .select();

    if (error) {
      console.log(error);
    }
    setFormData({
      agent: "",
      buyer: "",
      tags: "",
      status: "",
      gold: 2300,
      silver: 32,
      items: [],
    });
    navigate("/quotes");
  };
  const fetchQuotesByCustomer = async (customerName) => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("customerName", customerName);

    if (error) {
      console.error("Error fetching quotes:", error);
      return [];
    }

    return data;
  };

  const handleChange = (rowIndex, field, value) => {
    console.log(rowIndex, field, value, "rowIndex, field, value");
    const updatedData = [...formData.items];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [field]: value };
    console.log(updatedData, "updatedData");
    setFormData({ ...formData, items: updatedData });
  };
  const handleChangeUnauthenticated = async (rowIndex, field, value) => {
    console.log(
      rowIndex,
      field,
      value,
      "rowIndex, field, value in unauthenticated"
    );

    const { data, error } = await supabase
      .from("lineItems")
      .update({ BuyerComment: value })
      .eq("id", rowIndex);

    if (error) {
      console.error("Error updating quote:", error);
    }
  };
  const handleCustomSelect = (items) => {
    const itemData = items.map((item) => ({
      id: item.id,
      name: item.name,
      styleNumber: item.styleNumber,
      images: item.images,
      description: item.description,
      salesWeight: item.salesWeight,
      internalNote: "",
    }));
    console.log(itemData, "itemData");
    setFormData({ ...formData, items: [...formData.items, ...itemData] });
  };
  const updateIfChanged = async () => {
    const { data: currentData, error: fetchError } = await supabase
      .from("quotes")
      .select("*")
      .eq("quoteNumber", quote)
      .single();

    if (fetchError) {
      console.error("Error fetching current data:", fetchError);
      return;
    }

    // Find only the changed fields
    const changedFields = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== currentData[key]) {
        // Updated reference to formData
        acc[key] = formData[key]; // Only keep changed fields
      }
      return acc;
    }, {});

    if (Object.keys(changedFields).length === 0) {
      console.log("No changes detected, skipping update.");
      return;
    }

    // Update only if something changed
    const { data, error } = await supabase
      .from("quotes")
      .update(changedFields)
      .eq("quoteNumber", quote)
      .select();

    if (error) {
      console.error("Error updating:", error);
    } else {
      console.log("Updated row:", data);
    }
  };

  useEffect(() => {}, []);

  const isAuthenticatedRender = () => {
    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="p-6   flex-1 flex flex-col">
          <div className="flex flex-row">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">View Quote</h1>
              <select
                name="status"
                id=""
                value={formData.status}
                className={`p-2 ${getStatusColor}`}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Created:grey">Created:</option>
                <option value="Sent:yellow">Sent</option>
                <option value="Viewed:orange">Viewed</option>
                <option value="Paid:green">Paid</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col justify-between  items-center mb-6 flex-1 h-full">
            <div className="flex flex-row gap-2 ">
              <span className="self-center">Metal Prices At:</span>
              <div className="flex flex-col mb-1">
                <label htmlFor="gold_price">Gold Price</label>
                <input
                  type="number"
                  className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="gold"
                  id="gold_price"
                  placeholder="2300"
                  value={formData.gold}
                  onChange={(e) =>
                    setFormData({ ...formData, gold: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col mb-1">
                <label htmlFor="silver_price">Silver Price</label>
                <input
                  type="number"
                  className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="silver"
                  id="silver_price"
                  placeholder="32"
                  value={formData.silver}
                  onChange={(e) =>
                    setFormData({ ...formData, silver: e.target.value })
                  }
                />
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 flex flex-col  flex-1 h-full"
            >
              <div className="flex flex-1 h-full ">
                <div className="overflow-auto h-full border border-gray-300 flex-1">
                  <table className="w-full min-h-full border-collapse border border-gray-300 flex-1 table-fixed ">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2 w-20">
                          Item
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Image
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Description
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Weight
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Price
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Internal Note
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Buyer Remark
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((lineItem, index) => {
                        let product = productInfo.find(
                          (product) => product.id === lineItem.productId
                        );
                        // console.log(product,'product')
                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2 text-center">
                              <span className="flex flex-col">
                                {product.styleNumber}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <div className="flex flex-col">
                                <img
                                  src={product.images[0]} 
                                  alt={product.styleNumber}
                                />
                                {product.images.length >1 ? (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setImageModelOpen(true);
                                    }}
                                    className="px-2 py-2 bg-chabot-gold text-white rounded"
                                  >
                                    {" "}
                                    More Photos
                                  </button>
                                ) : (
                                  ""
                                )}
                                <MoreImageModel
                                  onClose={() => setImageModelOpen(false)}
                                  images={product.images}
                                  isOpen={isImageModelOpen}
                                />
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {product.description}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {product.weight}g
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              ${lineItem.salesPrice}
                            </td>
                            <EditableCellWithGenerics
                              handleChange={handleChange}
                              setEditingCell={setEditingCell}
                              editingCell={editingCell}
                              id={index}
                              cellType={"internalNote"}
                              data={lineItem.internalNote} // Placeholder for actual data
                            />
                            <td className="border border-gray-300 p-2 text-center">
                              {formData.buyerComments || "No Remarks"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-row w-full justify-between self-end ">
                <div className="flex flex-row mb-1 gap-2 ">
                  <div className="flex flex-col mb-1">
                    <label htmlFor="">Reference</label>
                    <input
                      type="text"
                      className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                      name="reference"
                      id=""
                      placeholder="Customer Ref / Labels"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col mb-1">
                    <label htmlFor="">Prepared For</label>
                    <input
                      type="text"
                      className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                      name="buyer"
                      id=""
                      placeholder="Prepared By"
                      value={formData.buyer}
                      onChange={(e) =>
                        setFormData({ ...formData, buyer: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-self-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    onClick={() => navigate("/quotes")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
                  >
                    {quote ? "Update Quote" : "Add Quote"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  const isNotAuthenticatedRender = () => {
    console.log("not authenticated", formData.retailPrice);
    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="p-6   flex-1 flex flex-col">
          <div className="flex flex-col justify-between  items-center mb-6 flex-1 h-full">
            {/* <div className="flex flex-row gap-2 " >
                                <span className='self-center'>Metal Prices At:</span>
                                <div className="flex flex-col mb-1">
                                    <label htmlFor="gold_price">Gold Price</label>
                                    <input type="number" className=" block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1" name="gold" id="gold_price" placeholder='2300' value={formData.gold} onChange={(e) => setFormData({...formData, gold: e.target.value})}/>
                                </div>
                                <div className="flex flex-col mb-1">
                                    <label htmlFor="silver_price">Silver Price</label>
                                    <input type="number" className=' block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1' name="silver" id="silver_price" placeholder='32' value={formData.silver} onChange={(e) => setFormData({...formData, silver: e.target.value})}/>
                                </div>
                            </div> */}
            <form className="p-6 flex flex-col  flex-1 h-full">
              <div className="flex  h-full flex-col">
                {/* <div className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0"> */}
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="text-[#C5A572] text-3xl font-serif tracking-wider">
                      E CHABOT
                    </div>
                    <div className="text-[#C5A572] text-sm mt-1">EST. 1993</div>
                  </div>
                </div>

                <div className="flex flex-row justify-between">
                  <h1 className=" py-5 text-xl font-bold">Quote:</h1>
                  <div className="flex flex-row gap-2">
                    {/* <span className="self-center">Metal Prices At:</span> */}
                    <div className="flex flex-col mb-1">
                      <label htmlFor="gold_price">Gold Price</label>
                      <span className="border-2 border-black p-2 rounded">
                        ${formData.gold}
                      </span>
                    </div>
                    <div className="flex flex-col mb-1">
                      <label htmlFor="silver_price">Silver Price</label>
                      <span className="border-2 border-black p-2 rounded">
                        {" "}
                        ${formData.silver}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="overflow-auto h-full border border-gray-300 flex-1">
                  <table className="w-full min-h-full border-collapse border border-gray-300 flex-1 table-fixed ">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2 w-20">
                          Item
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Image
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Weight
                        </th>
                        <th className="border border-gray-300 p-2 w-20">
                          Price
                        </th>
                        {/* <th className="border border-gray-300 p-2 w-20">Internal Note</th> */}
                        <th className="border border-gray-300 p-2 w-20">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((lineItem, index) => {
                        let product = productInfo.find(
                          (product) => product.id === lineItem.productId
                        );
                        // console.log(product,'product')
                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2 text-center">
                              <span className="flex flex-col">
                                {product.styleNumber}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <div className="flex flex-col">
                                <img
                                  src={product.images[0]}
                                  alt={product.styleNumber}
                                />
                                {product.images.length > 1 ? (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setImageModelOpen(true);
                                    }}
                                    className="px-2 py-2 bg-chabot-gold text-white rounded"
                                  >
                                    {" "}
                                    More Photos
                                  </button>
                                ) : (
                                  ""
                                )}
                                <MoreImageModel
                                  onClose={() => setImageModelOpen(false)}
                                  images={product.images}
                                  isOpen={isImageModelOpen}
                                />
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {product.weight}g
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              ${lineItem.salesPrice}
                            </td>
                            <EditableCellWithGenerics
                              handleChange={handleChangeUnauthenticated}
                              setEditingCell={setEditingCell}
                              editingCell={editingCell}
                              id={lineItem.id}
                              cellType={"BuyerComments"}
                              data={
                                lineItem.BuyerComment.trim() === ""
                                  ? null
                                  : lineItem.buyerComment
                              } // Placeholder for actual data
                            />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="w-full border-b border-x border-gray-300 pl-3">
                  <span>
                    Quote Total:
                    {lineItems
                      .reduce((total, item) => total + item.salesPrice, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      {forPdf
        ? isNotAuthenticatedRender()
        : isAuthenticated
        ? isAuthenticatedRender()
        : isNotAuthenticatedRender()}
    </div>
  );
}
