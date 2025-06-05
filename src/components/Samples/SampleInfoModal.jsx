import React, {
  useState,
  Fragment,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import ImageUpload from "../ImageUpload";
import { useSupabase } from "../SupaBaseProvider";
import { ChevronDown, X, Upload } from "lucide-react";
import { getStatusColor } from "../../utils/designUtils";
import { formatShortDate } from "../../utils/dateUtils";
import CustomSelect from "../CustomSelect";
import { metalTypes, getMetalType } from "../../utils/MetalTypeUtil";
import StonePropertiesForm from "../Products/StonePropertiesForm";
import CalculatePrice from "./CalculatePrice";
import TotalCost from "./TotalCost";
import { data, useNavigate } from "react-router-dom";
// import {limitInput} from '../../utils/inputUtils.js'
import { useVendorStore } from "../../store/VendorStore";
const SampleInfoModal = ({ isOpen, onClose, sample, updateSample }) => {
  const navigate = useNavigate();
  const { getVendorById, vendors } = useVendorStore();

  console.log(sample, "sample from design info modal");
  const { supabase } = useSupabase();
  const { starting_info: passedStartingInfo, formData: passedFormData } =
    sample;
  const [lossPercent, setLossPercent] = useState(0);
  const [formDataOriginal, setFormDataOriginal] = useState({
    ...passedFormData,
    cad: passedFormData.cad ? passedFormData.cad : [],
  });
  const [starting_info_original, setStarting_info_original] = useState({
    ...passedStartingInfo,
    images: passedStartingInfo.images ? passedStartingInfo.images : [],
  });

  const [starting_info, setStarting_info] = useState({
    ...passedStartingInfo,
    images: passedStartingInfo.images ? passedStartingInfo.images : [],
  });
  const [formData, setFormData] = useState({
    ...passedFormData,
    cad: passedFormData.cad ? passedFormData.cad : [],
  });
  const [relatedQuotes, setRelatedQuotes] = useState([]);
  const [metalCost, setMetalCost] = useState();
  const vendorLossRef = useRef(null);

  useEffect(() => {
    if (!sample) return; // Ensure sample is defined
    console.log(sample, "sample images from useeffect");
    setFormDataOriginal({
      ...passedFormData,
      cad: passedFormData.cad ? passedFormData.cad : [],
    });

    setFormData({
      ...passedFormData,
      cad: passedFormData.cad ? passedFormData.cad : [],
    });

    setStarting_info_original({
      ...passedStartingInfo,
      images: passedStartingInfo.images ? passedStartingInfo.images : [],
    });

    setStarting_info({
      ...passedStartingInfo,
      images: passedStartingInfo.images ? passedStartingInfo.images : [],
    });
  }, [isOpen]);

  useEffect(() => {
    const fetchQuoteNumber = async () => {
      const { data, error } = await supabase
        .from("lineItems")
        .select(
          `
        quote:quoteNumber(id, quoteNumber,updated_at)
        `
        )
        .eq("productId", sample.formData.id);

      if (error) {
        console.log(error);
      }
      setRelatedQuotes(data);
    };
    fetchQuoteNumber();
    setLossPercent(
      getVendorById(sample.starting_info.vendor).pricingsetting.lossPercentage
    );
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleCustomSelect = (option) => {
    // console.log(option,'from handle select in edit')
    const { categories, value } = option;
    setStarting_info({ ...starting_info, [categories]: value });
    // console.log(formData,'formdata')
  };
  const limitInput = (e) => {
    let value = e.target.value;

    if (value.includes(".") && value.split(".")[1].length > 2) {
      console.log(value.slice(0, value.indexOf(".") + 3));
      setStarting_info({
        ...starting_info,
        [e.target.name]: parseFloat(value.slice(0, value.indexOf(".") + 3)),
      });
    } else {
      setStarting_info({
        ...starting_info,
        [e.target.name]: parseFloat(value),
      });
    }
  };

  const getRemovedImages = (originalImages, currentImages) => {
    return originalImages.filter((image) => !currentImages.includes(image));
  };
  const getObjectDifferences = (formData, originalData) => {
    const changes = { updated_at: new Date().toISOString() }; // Initialize changes with updated_at

    Object.keys(formData).forEach((key) => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
        // updated to use originalData
        changes[key] = formData[key];
      }
    });

    return changes;
  };
  const areObjectsEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };
  // Utility to compare stones by id
  const getStoneDifferences = (current, original) => {
    const updated = [];
    const added = [];
    const deleted = [];

    const originalMap = new Map(original.map((stone) => [stone.id, stone]));
    const currentMap = new Map(current.map((stone) => [stone.id, stone]));

    for (const stone of current) {
      if (!stone.id) {
        added.push({ ...stone, starting_info_id: starting_info.id }); // new stone
      } else if (!areObjectsEqual(stone, originalMap.get(stone.id))) {
        updated.push({ ...stone, starting_info_id: starting_info.id }); // changed stone
      }
    }

    for (const stone of original) {
      if (!currentMap.has(stone.id)) {
        deleted.push(stone.id); // removed stone
      }
    }

    return { added, updated, deleted };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      areObjectsEqual(formData, formDataOriginal) &&
      areObjectsEqual(starting_info, starting_info_original)
    ) {
      console.log("No changes detected");
      onClose();
      return;
    }
    console.log("Changes detected");
    const { stones, ...rest } = starting_info;
    const starting_info_changes = getObjectDifferences(
      rest,
      starting_info_original
    );
    const sampleUpdates = getObjectDifferences(formData, formDataOriginal);
    // Proceed with the update logic'
    if (Object.keys(sampleUpdates).length !== 0) {
      console.log(" changes in starting_info");
      const { data, error } = await supabase
        .from("samples")
        .update(sampleUpdates)
        .eq("id", passedFormData.id)
        .select();

      if (error) {
        console.error("Error updating sample:", error);
      }
    }
    const { added, updated, deleted } = getStoneDifferences(
      stones,
      starting_info_original.stones
    );
    console.log(added, stones, "added stones in smapleInfoModal");
    // INSERT new stones
    if (added.length > 0) {
      const { error: insertError } = await supabase.from("stones").insert(
        added.map((stone) => ({
          ...stone,
          starting_info_id: starting_info.id,
        }))
      );
      if (insertError) {
        console.error("Error inserting stones:", insertError);
      }
    }

    // UPDATE modified stones
    for (const stone of updated) {
      const { error: updateError } = await supabase
        .from("stones")
        .update(stone)
        .eq("id", stone.id);
      if (updateError) {
        console.error(`Error updating stone ID ${stone.id}:`, updateError);
      }
    }

    // DELETE removed stones
    if (deleted.length > 0) {
      const { error: deleteError } = await supabase
        .from("stones")
        .delete()
        .in("id", deleted);
      if (deleteError) {
        console.error("Error deleting stones:", deleteError);
      }
    }

    let images;
    if (Object.keys(starting_info_changes).length !== 0) {
      console.log(" changes in starting_info");
      const { data, error } = await supabase
        .from("starting_info")
        .update(starting_info_changes)
        .eq("id", passedStartingInfo.id);

      if (error) {
        console.error(
          "Error updating starting_info in sampleInfoModal:",
          error
        );
      }
    }

    const removedImages = getRemovedImages(
      starting_info_original.images,
      starting_info.images
    );

    console.log("sample updated:", formData);

    updateSample({ ...formData, starting_info: starting_info });
    setFormData({
      cad: [],
      category: "",
      collection: "",
      name: "",
      styleNumber: "",
      salesWeight: 0,
      status: "Working_on_it:yellow",
    });
    setStarting_info({
      description: "",
      images: [],
      color: "Yellow",
      height: 0,
      length: 0,
      width: 0,
      weight: 0,
      manufacturerCode: "",
      metalType: "Gold",
      platingCharge: 0,
      stones: [],
      vendor: null,
      plating: 0,
      karat: "10K",
      status: "Working_on_it:yellow",
    });

    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full  transform overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Edit Sample
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="flex flex-row">
                    <div className=" pr-6 ">
                      <div className="flex justify-between items-start flex flex-col min-h-[70vh] overflow-y-auto">
                        {/* this is the image upload  */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Images
                          </label>
                          <ImageUpload
                            // images={formData.images || []}
                            images={starting_info.images || []}
                            onChange={async (images) => {
                              setStarting_info({
                                ...starting_info,
                                images: images,
                              });
                              // await updateDataBaseWithImages(images, sample.id)
                            }}
                          />
                          <ImageUpload
                            images={formData.cad || []}
                            onChange={(cad) =>
                              setFormData({ ...formData, cad: cad })
                            }
                          />
                        </div>
                        {/* this is the status function */}
                        <div className="mt-6 mb-2 flex justify-center w-full gap-2 ">
                          <div className="flex flex-col ">
                            <label htmlFor="status" className="self-start">
                              Status:
                            </label>
                            <select
                              name="status"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  status: e.target.value,
                                })
                              }
                              value={formData.status}
                              className={`${getStatusColor(
                                formData.status
                              )} mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              <option value="Working_on_it:yellow">
                                Working on it
                              </option>
                              <option value="Quote_created:blue">
                                Quote Created
                              </option>
                              <option value="Running_line:green">
                                Running Line
                              </option>
                              <option value="Dead:red">Dead</option>
                            </select>
                          </div>

                          <div className="flex flex-col w-full overflow-hidden">
                            <span className="text-black text-sm">
                              Related Quotes
                            </span>
                            <div className="overflow-y-auto max-h-[200px] border border-gray-300 rounded-md p-2">
                              {relatedQuotes.length > 0
                                ? relatedQuotes
                                    .sort((a, b) => a.quote.id - b.quote.id)
                                    .map((quote, index) => {
                                      return (
                                        <div
                                          key={index}
                                          className="flex flex-col items-center"
                                        >
                                          <div className="flex justify-evenly items-center gap-2">
                                            <span>#{quote.quote.id}</span>
                                            <span>
                                              Last Updated:{" "}
                                              {formatShortDate(
                                                quote.quote.updated_at
                                              )}
                                            </span>
                                            <button
                                              onClick={() =>
                                                navigate(
                                                  `/newQuote?quote=${quote.quote.quoteNumber}`
                                                )
                                              }
                                              className="bg-chabot-gold text-white px-1 rounded-lg flex items-center hover:bg-gray-300 hover:rounded transition-colors"
                                            >
                                              Go to quote
                                            </button>
                                          </div>
                                          <hr className="border-t border-gray-500 w-full my-1" />
                                        </div>
                                      );
                                    })
                                : "No quotes found for this sample"}
                            </div>
                          </div>
                        </div>
                        <div className="w-full">
                          <TotalCost
                            metalCost={metalCost}
                            miscCost={starting_info.miscCost}
                            laborCost={starting_info.laborCost}
                            stones={starting_info.stones}
                            updateTotalCost={(cost) =>
                              setStarting_info({
                                ...starting_info,
                                totalCost: cost,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className=" flex-1 space-y-6">
                      <div className="flex flex-row gap-2 w-full">
                        <div className="w-full ">
                          <label className="block text-sm font-medium text-gray-700">
                            Style Number
                          </label>
                          <input
                            required
                            type="text"
                            className="mt-1 block input shadow-sm "
                            value={formData.styleNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                styleNumber: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="w-full ">
                          <label className="block text-sm font-medium text-gray-700">
                            Manufacturer Code
                          </label>
                          <input
                            required
                            type="text"
                            className="mt-1 block input shadow-sm  "
                            value={starting_info.manufacturerCode}
                            onChange={(e) =>
                              setStarting_info({
                                ...starting_info,
                                manufacturerCode: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-row gap-2 w-full">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700">
                            Product Sku
                          </label>
                          <input
                            // required
                            type="text"
                            className="mt-1 block input shadow-sm  flex-1"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="w-full">
                          <label className="block  text-sm font-medium text-gray-700">
                            Vendor
                          </label>
                          <div className="relative w-full">
                            <select
                              name="vendor"
                              onChange={(e) => {
                                setStarting_info({
                                  ...starting_info,
                                  vendor: e.target.value,
                                });
                                setLossPercent(
                                  getVendorById(Number(e.target.value))
                                    .pricingsetting.lossPercentage
                                );
                              }}
                              value={starting_info.vendor}
                              className={` mt-1 border input  p-2 appearance-none `}
                            >
                              {vendors.map((vendor, index) => {
                                return (
                                  <option key={index} value={vendor.id}>
                                    {vendor.name}
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={starting_info.description || ''}
                          onChange={(e) =>
                            setStarting_info({
                              ...starting_info,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* this is metal properties div */}
                      <div>
                        <label htmlFor=""> Metal Propeties</label>
                        <br className="border-2 border-gray-300 w-full" />

                        <div className="flex flex-col">
                          <label htmlFor=""> Metal Type</label>
                          <div className="relative w-full">
                            <select
                              name="metalType"
                              id=""
                              onChange={(e) => {
                                const selectedMetalType = e.target.value;
                                const metal = getMetalType(selectedMetalType);

                                setStarting_info({
                                  ...starting_info,
                                  metalType: selectedMetalType,
                                  karat: metal.karat[0], // default to first karat
                                  color: metal.color[0], // default to first color
                                });
                              }}
                              value={starting_info.metalType}
                              className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                            >
                              {metalTypes.map((metalType, index) => {
                                return (
                                  <option key={index} value={metalType.type}>
                                    {metalType.type}
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor=""> Karat</label>

                          <div className="relative w-full">
                            <select
                              name="karat"
                              id=""
                              onChange={(e) =>
                                setStarting_info({
                                  ...starting_info,
                                  karat: e.target.value,
                                })
                              }
                              value={starting_info.karat}
                              className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                            >
                              {getMetalType(starting_info.metalType).karat.map(
                                (karat, index) => {
                                  return (
                                    <option key={index} value={karat}>
                                      {karat}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor=""> Color</label>
                          <div className="relative w-full">
                            <select
                              name="color"
                              id=""
                              onChange={(e) =>
                                setStarting_info({
                                  ...starting_info,
                                  color: e.target.value,
                                })
                              }
                              value={formData.color}
                              className={` mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`}
                            >
                              {getMetalType(starting_info.metalType).color.map(
                                (color, index) => {
                                  return (
                                    <option key={index} value={color}>
                                      {color}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {/*this is weight sectiion  */}

                      <div className="flex flex-row gap-2 w-full">
                        <div className="w-full">
                          <label htmlFor="">Weight</label>
                          <div className="flex items-center gap-1 ">
                            <span className="w-full relative">
                              <input
                                type="text"
                                placeholder="Enter Weight"
                                className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full "
                                value={starting_info.weight}
                                required={true}
                                onChange={(e) =>
                                  setStarting_info({
                                    ...starting_info,
                                    weight: e.target.value,
                                  })
                                }
                              />
                            </span>
                            <span className="absolute right-10 text-gray-500 pointer-events-none">
                              grams
                            </span>
                          </div>
                        </div>
                        <div className="w-full">
                          <label htmlFor="">Sales Weight</label>
                          <div className="flex items-center gap-1 ">
                            <span className="w-full relative">
                              <input
                                type="text"
                                placeholder="Enter Weight"
                                className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full "
                                value={formData.salesWeight}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    salesWeight: e.target.value,
                                  })
                                }
                              />
                            </span>
                            <span className="absolute right-10 text-gray-500 pointer-events-none">
                              grams
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full">
                        <CalculatePrice
                          type={starting_info.metalType}
                          weight={starting_info.weight}
                          karat={starting_info.karat}
                          lossPercent={lossPercent}
                          onMetalCostChange={setMetalCost}
                        />
                      </div>

                      {/* this is loss section */}
                      <div className="flex flex-row w-full flex-1 justify-between">
                        <div className="w-md">
                          <label htmlFor="loss">Loss Percent</label>
                          <div className="flex items-center gap-1 flex-1">
                            <span
                              ref={vendorLossRef}
                              className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              {lossPercent}
                            </span>
                            <span>%</span>
                          </div>
                        </div>

                        {/* this is the separation between loss and plating input fields */}
                        <div className="flex flex-row gap-2 justify-center">
                          <div className="flex flex-col justify-center flex-1">
                            <label htmlFor="plating">Plating</label>
                            <CustomSelect
                              onSelect={handleCustomSelect}
                              version={"plating"}
                              informationFromDataBase={starting_info.plating}
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor="plating_charge">
                              Plating Charge
                            </label>
                            <input
                              type="number"
                              value={starting_info.platingCharge}
                              name="platingCharge"
                              onChange={limitInput}
                              className="mt-1 block input shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* this is the stone properties */}
                      <div>
                        <StonePropertiesForm
                          stones={starting_info.stones || []}
                          onChange={(stones) => {
                            setStarting_info({
                              ...starting_info,
                              stones: stones,
                            });
                          }}
                        />
                      </div>

                      <div className="flex flex-row gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Labor Cost
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="laborCost"
                              value={starting_info.laborCost || 0}
                              onChange={limitInput}
                              className="w-full input pl-7 pr-3 py-2"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Misc Cost
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                $
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              name="miscCost"
                              value={starting_info.miscCost || 0}
                              onChange={limitInput}
                              className="w-full input pl-7 pr-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col ">
                        <label htmlFor="back_type">Back Type</label>
                        <div className="flex flex-row gap-2">
                          <div className="relative w-full">
                            <select
                              name="back_type"
                              id=""
                              className="mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              value={formData.back_type}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  back_type: e.target.value,
                                })
                              }
                            >
                              <option value="none">None</option>
                              <option value="silicone">Silicone</option>f
                              <option value="screw">Screw</option>
                              <option value="flat">Flat</option>
                              <option value="other">Other</option>
                            </select>
                            <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                            {formData.back_type === "other" && (
                              <input
                                type="text"
                                className="mt-1  input pr-7 pl-3 py-2"
                                placeholder="Enter custom back type"
                                value={formData.custom_back_type}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    custom_back_type: e.target.value,
                                  })
                                }
                              />
                            )}
                          </div>
                          <div className=" w-full">
                            <label htmlFor="back_type_quantity">
                              Back Type Quantity
                            </label>
                            <input
                              type="number"
                              className="mt-1  input pr-7 pl-3 py-2"
                              value={formData.back_type_quantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  back_type_quantity: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col ">
                        <label htmlFor="selling_pair">Selling type</label>
                        <div className="relative w-full">
                          <select
                            name="selling_pair"
                            id=""
                            className="mt-1  border border-gray-300 rounded-md p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            value={formData.selling_pair}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                selling_pair: e.target.value,
                              })
                            }
                          >
                            <option value="pair">Pair</option>
                            <option value="single">Single</option>
                          </select>
                          <ChevronDown className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="dims">Dimensions</label>
                        <div className="flex flex-row gap-2 ">
                          <div className=" relative rounded-md shadow-sm w-full">
                            <label htmlFor="length">Length</label>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                mm
                              </span>
                            </div>
                            <input
                              type="number"
                              className="mt-1  input pr-7 pl-3 py-2"
                              value={starting_info.length}
                              onChange={(e) => {
                                setStarting_info({
                                  ...starting_info,
                                  length: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className=" relative rounded-md shadow-sm w-full">
                            <label htmlFor="width">Width</label>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                mm
                              </span>
                            </div>
                            <input
                              type="number"
                              className="mt-1  input pr-7 pl-3 py-2"
                              value={starting_info.width}
                              onChange={(e) => {
                                setStarting_info({
                                  ...starting_info,
                                  width: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className=" relative rounded-md shadow-sm w-full">
                            <label htmlFor="height">Height</label>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                mm
                              </span>
                            </div>
                            <input
                              type="number"
                              className="mt-1  input pr-7 pl-3 py-2"
                              value={starting_info.height}
                              onChange={(e) => {
                                setStarting_info({
                                  ...starting_info,
                                  height: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col w-full">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          rows={3}
                          placeholder="Optional notes"
                          className="mt-1 input w-full "
                        />
                      </div>
                      {/* <TotalCost
                        metalCost={metalCost}
                        miscCost={starting_info.miscCost}
                        laborCost={starting_info.laborCost}
                        stones={starting_info.stones}
                        updateTotalCost={(cost) =>
                          setStarting_info({
                            ...starting_info,
                            totalCost: cost,
                          })
                        }
                      /> */}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-chabot-gold hover:bg-opacity-90 rounded-md"
                    >
                      Update Sample
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SampleInfoModal;
