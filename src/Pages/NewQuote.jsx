import { useSupabase } from "../components/SupaBaseProvider";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getImages } from "../components/SupaBaseProvider";
import CustomSelectWithSelections from "../components/CustomSelectWithSelections";
import { useNavigate } from "react-router-dom";
import { useMessage } from "../components/Messages/MessageContext";
import useFormUpdater from "../Hooks/UseFormUpdater";
import { getMetalCost } from "../components/Samples/CalculatePrice";
import { useMetalPriceStore } from "../store/MetalPrices";
import { getTotalCost } from "../components/Samples/TotalCost";
import { useLocation } from "react-router-dom";
import EditableCellWithGenerics from "../components/Qoutes/EditableCellWithGenerics";
import { useGenericStore } from "../store/VendorStore";
import CustomSelect from "../components/CustomSelect";

export default function NewQuote() {
  const navigate = useNavigate();
  const location = useLocation();
  const allowedLineItemFields = [
    "id",
    "productId",
    "retailPrice",
    "internalNote",
    "margin",
    "totalCost",
    "salesPrice",
    "quoteNumber",
    "BuyerComment",
    // add any other fields that are valid in your lineItems table
  ];
  const { prices } = useMetalPriceStore();
  const { supabase, session } = useSupabase();

  const { showMessage } = useMessage();
  const [productInfo, setProductInfo] = useState([]);
  const [lineItems, setlineItems] = useState([]);
  const [lineItemsToDelete, setlineItemsToDelete] = useState([]);
  const quote = new URLSearchParams(location.search).get("quote") || null;
  const userId = session?.user?.id; // User ID

  const { formData, updateFormField, resetForm } = useFormUpdater({
    buyer: null,
    tags: "",
    status: "Created:grey",
    agent: userId,
    gold: parseFloat(prices.gold.price),
    silver: parseFloat(prices.silver.price),
    multiplier: 4,
    bulkMargin: 0,
    quoteTotal: 0,
    // retailPrice: 0,
  });

  const { getEntityItemById, getEntity } = useGenericStore();
  const vendors = getEntity("vendors");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  const [isOpen, setIsOpen] = useState(false);

  // Fetch quote and line items if quote param exists
  useEffect(() => {
  if (quote) {
    console.log(quote, "quote from params");
    const fetchQuote = async () => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("quote_with_lineitems_and_product")
        .select('*')
        .eq("quoteNumber", quote)
        .single();

      console.log(data, "data from supabase");

      // Process line items and fetch images
      const processedLineItems = await Promise.all(
        data.lineitems.map(async (item) => {
          const {product,internalNote,margin,lineItemId,BuyerComment,bulkMargin} = item
          const {styleNumber, images,cad,sample_id,starting_description,weight,salesWeight} = product || {}
          console.log(product,"product in line item")

          // Calculate cost, salesPrice, retailPrice like handleCustomSelect
          const vendor = getEntityItemById("vendors", product.vendor);
          const lossPercentage = vendor?.pricingsetting?.lossPercentage || 0;
          const cost = parseFloat(
            totalCost(
              product,
              lossPercentage
            ).toFixed(2)
          ) || 0;
          const salesPrice = cost;
          const retailPrice =
            parseFloat((salesPrice * (formData.multiplier || 1)).toFixed(2)) || 0;

          return {
            ...product,
            productId: sample_id,
            // styleNumber, images,cad,
            description:starting_description||'',
            retailPrice,
            weight,
            salesWeight,
            internalNote: internalNote || "",
            margin: margin ?? formData.bulkMargin,
            bulkMargin: bulkMargin || 0,
            totalCost: cost,
            salesPrice,
            id: lineItemId, // keep the line item id for updates
            BuyerComment: BuyerComment || '',
          };
        })
      );
      console.log(processedLineItems, "processed line items");
      setlineItems(processedLineItems);

      if (error) {
        console.error("Error fetching samples:", error);
        return;
      }
      const { lineitems, ...dataWithoutLineItems } = data;
      resetForm(dataWithoutLineItems);
      setIsLoading(false);
    };
    fetchQuote();
  } else {
    console.log("not displaying a quote");
  }
},[quote])

  // Filter only allowed fields for DB insert/update
  const filterLineItemFields = (item) =>
    Object.fromEntries(
      Object.entries(item).filter(([key]) =>
        allowedLineItemFields.includes(key)
      )
    );

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      showMessage("Please add items to the quote", "error");
      return;
    }
    const quoteTotal = lineItems.reduce((acc, item) => acc + item.totalCost, 0);
    const { lineItems: dontUse, ...rest } = formData;
    const submitForm = {
      ...rest,
      updated_at: new Date().toISOString(),
      quoteTotal: quoteTotal,
    };
    if (quote) {
      await updateIfChanged(submitForm);
      await updateLineItem();
      await updateIfLineItemsChanged();
      await handleLineItemsToDelete();
      showMessage("Quote Updated", "success");
      navigate("/quotes");
      return;
    }
    const { data, error } = await supabase
      .from("quotes")
      .insert([submitForm])
      .select()
      .single();

    if (error) {
      console.error(error);
    }
    showMessage("Quote Created", "success");
    const { error: lineItemError } = await supabase.from("lineItems").insert(
      lineItems.map((item) => ({
        ...filterLineItemFields(item),
        quoteNumber: data.quoteNumber,
      }))
    );
    if (lineItemError) {
      console.error(lineItemError);
    }
  };

  // Update quote if changed
  const updateIfChanged = async (submitForm) => {
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
    const changedFields = Object.keys(submitForm).reduce((acc, key) => {
      if (submitForm[key] !== currentData[key]) {
        acc[key] = submitForm[key];
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

  // Insert new line items if changed
  const updateIfLineItemsChanged = async () => {
    let newLineItems = lineItems.filter((lineItem) => !lineItem.id);
    console.log(newLineItems, "new line items");

    const { error } = await supabase.from("lineItems").insert(
      newLineItems.map((item) => ({
        ...filterLineItemFields(item),
        quoteNumber: quote,
      }))
    );

    if (error) {
      console.error(error);
    }
  };

  // Upsert (update) existing line items
  const updateLineItem = async () => {
    console.log(lineItems, "line items to update");
    let lineItemsToUpdate = lineItems
      .filter((lineItem) => lineItem.id)
      .map((item) => {
        return filterLineItemFields(item);
      });

    const { error } = await supabase.from("lineItems").upsert(
      lineItemsToUpdate.map((item) => ({
        ...item,
        quoteNumber: quote,
      })),
      { onConflict: ["id"] }
    );

    if (error) {
      console.error(error);
    }
  };

  // Delete line items marked for deletion
  const handleLineItemsToDelete = async () => {
    if (lineItemsToDelete.length > 0) {
      const { error } = await supabase
        .from("lineItems")
        .delete()
        .in("id", lineItemsToDelete);

      if (error) {
        console.error("Error deleting line items:", error);
      }
    }
  };

  // Handle changes to a line item (margin, salesPrice, etc.)
  const handleLineChange = (productId, field, value) => {
    setlineItems((prevItems) =>
      prevItems.map((item) => {
        console.log(productId, field, value, "productId, field, value",(item.productId ?? item.sample_id) !== productId,'item.productId || item.sample_id!== productId');
        if ((item.productId ?? item.sample_id) !== productId) return item;
        const updatedItem = { ...item, [field]: value };

        // If margin was updated, calculate new salesPrice and retailPrice
        if (field === "margin") {
          const weight =
            productInfo.find((item) => item.productId === productId)?.weight ||
            0;
          const totalCost = parseFloat(item.totalCost.toFixed(2)) || 0;
          const margin = parseInt(value) || 0;
          const retailPrice =
            parseFloat((item.salesPrice * formData.multiplier).toFixed(2)) || 0;
          const salesPrice = parseFloat(
            +(totalCost / (1 - margin / 100)).toFixed(2)
          );

          console.log(
            +(totalCost / (1 - margin / 100)).toFixed(2),
            parseFloat(+(totalCost / (1 - margin / 100)).toFixed(2)),
            margin,
            "total cost after margin"
          );
          updatedItem.salesPrice = salesPrice;
          updatedItem.retailPrice = retailPrice;
        }
        // If salesPrice was updated, recalc margin
        if (field === "salesPrice") {
          const totalCost = parseFloat(item.totalCost.toFixed(2)) || 0;
          const salesPrice = parseFloat(value) || 0;
          updatedItem.margin = parseFloat(
            +(((salesPrice - totalCost) / salesPrice) * 100).toFixed(2)
          );
        }

        // Log updated item for debugging
        console.log(updatedItem, "updated item");
        return updatedItem;
      })
    );
  };

  // Handle selection of new products/items
  const handleCustomSelect = (items) => {
    items.forEach((element) => {
      const lossPercentage =
        getEntityItemById("vendors", element.vendor)?.pricingsetting
          ?.lossPercentage || 0;
      const cost =
        parseFloat(totalCost(element, lossPercentage).toFixed(2)) || 0;
      const salesPrice = cost;
      const retailPrice =
        parseFloat((salesPrice * (formData.multiplier || 1)).toFixed(2)) || 0;
      // Log cost and retail price for debugging
      console.log(cost, retailPrice, "cost and retail price");
    });

    const itemData = items.map((item) => {
      const lossPercentage =
        getEntityItemById("vendors", item.vendor)?.pricingsetting
          ?.lossPercentage || 0;
      const cost = parseFloat(totalCost(item, lossPercentage).toFixed(2)) || 0;
      const salesPrice = cost;
      const retailPrice =
        parseFloat((salesPrice * (formData.multiplier || 1)).toFixed(2)) || 0;
      // Log each item for debugging
      console.log(
        {
          ...item,
          productId: item.sample_id,
          retailPrice,
          internalNote: "",
          margin: formData.bulkMargin,
          totalCost: cost,
          salesPrice,
        },
        "item to add"
      );
      return {
        ...item,
        productId: item.sample_id,
        retailPrice,
        internalNote: "",
        margin: formData.bulkMargin,
        totalCost: cost,
        salesPrice,
      };
    });
    console.log(itemData, "item data to add");
    setlineItems((prev) => [...prev, ...itemData]);
  };

  // Remove a line item from the list
  const deleteLineItem = (event, product) => {
    console.log(product?.id || product?.sample_id || "no id");
    event.preventDefault();
    product?.id
      ? setlineItemsToDelete((prevItems) => [...prevItems, product?.id])
      : "";
    setlineItems((prevItems) =>
      prevItems.filter((item) => item.productId !== product.productId)
    );
  };

  // Helper to safely convert to number
  const safeNumber = (val) => Number(val) || 0;

  // Calculate total cost for a product
  const totalCost = (product, lossPercentage) => {
    const metalPrice =
      product.metalType === "Gold"
        ? safeNumber(formData.gold)
        : safeNumber(formData.silver);
    const weight = safeNumber(product.weight);
    const karat = product.karat;
    const loss = safeNumber(lossPercentage);
    const miscCost = safeNumber(product.miscCost);
    const laborCost = safeNumber(product.laborCost);

    if (!metalPrice) {
      console.error("Metal price is missing!");
      return 0;
    }

    // Log all input values for debugging
    console.log(
      {
        metalPrice,
        weight,
        karat,
        loss,
        miscCost,
        laborCost,
        stones: product.stones,
      },
      "totalCost input values"
    );

    const metalCost = getMetalCost(metalPrice, weight, karat, loss);
    const totalCost = getTotalCost(
      metalCost,
      miscCost,
      laborCost,
      product.stones
    );
    // Log calculated costs for debugging
    console.log(metalCost, "metal cost", totalCost, "total cost calculated");
    return totalCost;
  };

  // Update totalCost and salesPrice when metal prices change
  useEffect(() => {
    setlineItems((prevItems) =>
      prevItems.map((item) => {
        

        const vendor = getEntityItemById("vendors", item.vendor);
        const lossPercentage = vendor?.pricingsetting?.lossPercentage || 0;

        const oldCost = item.totalCost || 0;
        const newCost = parseFloat(
          totalCost(item, lossPercentage).toFixed(2)
        );
        const costDifference = newCost - oldCost;

        const oldSalesPrice = item.salesPrice || 0;
        const newSalesPrice = parseFloat(
          (oldSalesPrice + costDifference).toFixed(2)
        );

        const marginPercent =
          newSalesPrice > 0
            ? parseFloat(
                (((newSalesPrice - newCost) / newSalesPrice) * 100).toFixed(2)
              )
            : 0;

        // Log recalculated values
        console.log(
          {
            oldCost,
            newCost,
            costDifference,
            oldSalesPrice,
            newSalesPrice,
            marginPercent,
          },
          "recalculated line item values"
        );

        return {
          ...item,
          totalCost: newCost,
          salesPrice: newSalesPrice,
          margin: marginPercent,
        };
      })
    );
  }, [formData.gold, formData.silver]);

  // Recalculate salesPrice for each line item when bulkMargin changes
  useEffect(() => {
    setlineItems((prevItems) =>
      prevItems.map((item) => {
        const totalCost = parseFloat(item.totalCost.toFixed(2)) || 0;
        const salesPrice = parseFloat(
          +(totalCost / (1 - formData.bulkMargin / 100)).toFixed(2)
        );
        // Log recalculated salesPrice
        console.log(
          {
            totalCost,
            salesPrice,
            bulkMargin: formData.bulkMargin,
          },
          "recalculated salesPrice for bulkMargin change"
        );
        return {
          ...item,
          salesPrice: salesPrice,
          margin: formData.bulkMargin,
        };
      })
    );
  }, [formData.bulkMargin]);

  // Recalculate retailPrice for each line item when multiplier or metal prices change
  useEffect(() => {
    console.log("form has been updated ");
    setlineItems((prevItems) =>
      prevItems.map((item) => {
        const retailPrice =
          parseFloat((item.salesPrice * formData.multiplier).toFixed(2)) || 0;
        // Log recalculated retailPrice
        console.log(
          {
            salesPrice: item.salesPrice,
            multiplier: formData.multiplier,
            retailPrice,
          },
          "recalculated retailPrice"
        );
        return {
          ...item,
          retailPrice: retailPrice,
        };
      })
    );
  }, [
    formData.multiplier,
    formData.gold,
    formData.silver,
    formData.bulkMargin,
  ]);

  // Log productInfo and lineItems for debugging
  console.log(productInfo, lineItems, "line items");

  return (
    <div className="flex flex-col min-h-[80vh]">
      <div className="p-6 flex-1 flex flex-col">
        {/* headers for the new quote page */}
        <div className="flex flex-row">
          <h1 className="text-2xl font-bold text-gray-900">
            {quote ? "Update Quote" : "Create Quote"}
          </h1>
          {/* this div supplies the user with a add and selection modal */}
          <div className="flex space-x-3 justify-self-end flex-col w-48 ml-auto">
            <button
              className="bg-chabot-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-90 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Items
            </button>
            <CustomSelectWithSelections
              version="sample_with_stones_export"
              selected={lineItems}
              close={() => setIsOpen(false)}
              onSelect={handleCustomSelect}
              isOpen={isOpen}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between items-end  mb-6 flex-1 h-full  ">
          <div className="flex flex-row gap-2 mt-4 w-full justify-between ">
            {/* metalPrices */}
            <div className="flex gap-2">
              <div className="flex flex-col mb-1">
                <label htmlFor="gold_price">Gold Price</label>
                <input
                  type="number"
                  className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="gold"
                  id="gold_price"
                  placeholder="2300"
                  value={formData.gold}
                  onChange={(e) =>
                    updateFormField("gold", parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="flex flex-col mb-1">
                <label htmlFor="silver_price">Silver Price</label>
                <input
                  type="number"
                  className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="silver"
                  id="silver_price"
                  placeholder="32"
                  value={formData.silver}
                  onChange={(e) =>
                    updateFormField("silver", parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              {/* bulk margins */}
              <div>
                <label htmlFor="bulk-margin">Bulk Margin</label>
                <input
                  type="number"
                  className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="bulk-margin"
                  id="bulk-margin"
                  onChange={(e) =>
                    updateFormField("bulkMargin", parseFloat(e.target.value))
                  }
                  value={formData.bulkMargin || 0}
                />
              </div>
              {/* retail price multipler */}
              <div>
                <label htmlFor="multiplier">Multipler</label>
                <input
                  type="number"
                  className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                  name="multiplier"
                  id="multiplier"
                  onChange={(e) =>
                    updateFormField("multiplier", parseInt(e.target.value))
                  }
                  value={formData.multiplier}
                />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="p-6 flex flex-col flex-1 h-full"
          >
            <div className="flex flex-1 h-full">
              <div className="overflow-auto h-full border border-gray-300 flex-1">
                <table className="w-full min-h-full border-collapse border border-gray-300 flex-1 table-fixed">
                  <thead className="bg-gray-200 sticky top-0 z-10">
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2 w-20">Item</th>
                      <th className="border border-gray-300 p-2 w-20">Image</th>
                      <th className="border border-gray-300 p-2 w-20">
                        Description
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Weights
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Total Cost
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Margins
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Sales Price
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Retail Price
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Internal Note
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Buyer Comment
                      </th>
                      <th className="border border-gray-300 p-2 w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems &&
                      lineItems.map((product, index) => {
                        console.log(product, "product in lineItems");
                        // let product = product;
                        return (
                          <tr key={index} className="h-32">
                            <td className="border border-gray-300 p-2 text-center">
                              {product.styleNumber ||
                                productInfo.name}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <img
                                src={product.images[0]}
                                alt={product.styleNumber}
                              />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {product.description}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <div className="flex flex-row items-center justify-center gap-2">
                                <div className="flex flex-col">
                                  <span>{product.weight}g</span>{" "}
                                  <span>w</span>
                                </div>
                                <div className="flex flex-col">
                                  <span>{product.salesWeight}g</span>{" "}
                                  <span>sw</span>
                                </div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              ${product.totalCost}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="number"
                                value={product.margin || 0}
                                onChange={(e) => {
                                  e.preventDefault();
                                  handleLineChange(
                                    product.productId || product.sample_id,
                                    "margin",
                                    parseInt(e.target.value)
                                  );
                                }}
                                className="input w-full text-center border-none outline-none"
                              />
                              <span className="ml-1">%</span>
                            </td>
                            <EditableCellWithGenerics
                              handleChange={handleLineChange}
                              setEditingCell={setEditingCell}
                              editingCell={editingCell}
                              id={product.productId}
                              cellType={"salesPrice"}
                              data={product.salesPrice}
                            />
                            <EditableCellWithGenerics
                              handleChange={handleLineChange}
                              setEditingCell={setEditingCell}
                              editingCell={editingCell}
                              id={product.productId}
                              cellType={"retailPrice"}
                              data={product.retailPrice}
                            />
                            <EditableCellWithGenerics
                              handleChange={handleLineChange}
                              setEditingCell={setEditingCell}
                              editingCell={editingCell}
                              id={product.productId || product.sample_id}
                              cellType={"internalNote"}
                              data={product.internalNote}
                            />
                            <td className="border border-gray-300 p-2 text-center  ">
                              {product.BuyerComment}
                            </td>
                            <td className=" flex justify-center items-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  deleteLineItem(event, product);
                                }}
                                className="border border-gray-300 p-2 text-center bg-red-500 text-white rounded-md hover:bg-red-600 "
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-row w-full justify-between self-end">
              <div className="flex flex-row mb-1 gap-2">
                <div className="flex flex-col mb-1">
                  <label htmlFor="reference">Reference</label>
                  <input
                    type="text"
                    className="block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                    name="reference"
                    id="reference"
                    placeholder="Customer Ref / Labels"
                    value={formData.tags}
                    onChange={(e) => updateFormField("tags", e.target.value)}
                  />
                </div>
                <div className="flex flex-col mb-1">
                  <label htmlFor="buyer">Prepared For</label>
                  <CustomSelect
                    onSelect={(option) => {
                      const { categories, value } = option;
                      updateFormField("buyer", value);
                    }}
                    version={"customers"}
                    hidden={false}
                    informationFromDataBase={formData.buyer}
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
                  {quote ? "Update Quote" : "Create Quote"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
