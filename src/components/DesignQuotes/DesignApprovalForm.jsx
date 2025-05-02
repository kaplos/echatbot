import React, { useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {getMetalCost} from "../Samples/CalculatePrice";
import TotalCost from "../Samples/TotalCost";
import { formatDate } from "../../utils/dateUtils";
import { ChevronDown, X,Upload } from 'lucide-react';
import { useSupabase } from "../SupaBaseProvider";
import { useVendorStore } from "../../store/VendorStore";
import { useMetalPriceStore } from "../../store/MetalPrices";
export default function DesignApprovalForm({ design, openEditModal, isOpen, onClose,updateDesign }) {
  const {getVendorById,vendors}= useVendorStore()
  const {prices}=useMetalPriceStore()
  const { supabase } = useSupabase();
  let totalCost = 0
  useEffect(() => {
    console.log("design in design approval form", design);
  }, [design]);
 const handleUpdateStatus = async (status) => {
    if(status === "approved") {
      const { data, error } = await supabase
        .from("samples")
        .insert([{
          starting_info_id: design.id,
          status: "working_on_it:yellow",
          totalCost: totalCost
        }])

      if (error) {
        console.error("Error updating design status:", error);
        return;
      }
    }

    const { data, error } = await supabase
      .from("starting_info")
      .update({ status: status })
      .eq("id", design.id)
      .select("*");

    if (error) {
      console.error("Error updating design status:", error);
      return;
    }
    console.log(data, "data from click");
    updateDesign(data[0]);
    // setIsDetailsOpen(true);
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" leave="ease-in duration-200"
          enterFrom="opacity-0" enterTo="opacity-100"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                <div className="flex justify-between items-center p-6 border-b">
                                              <Dialog.Title className="text-xl font-semibold text-gray-900">
                                                Approval Form
                                              </Dialog.Title>
                                              <button
                                                onClick={onClose}
                                                className="text-gray-400 hover:text-gray-500"
                                              >
                                                <X className="w-5 h-5" />
                                              </button>
                                            </div>
                  <div className="p-2 flex"> <button onClick={()=>{openEditModal();onClose()}} className="hover:text-black text-gray-500 text-sm self-end justify-self-end">✏️</button></div>

                {/* Status & Description */}
                <div className="mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-gray-200 text-xs px-2 py-0.5 rounded">{design.status}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">Description</span>
                    <span className="font-medium">{design.description}</span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{formatDate(design.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span>{formatDate(design.updated_at)}</span>
                  </div>
                </div>

                {/* Cost */}
                <div className="mb-4 w-full">
                  
                  <TotalCost
                    metalCost={getMetalCost(prices[design.metalType.toLowerCase()].price,design.weight,design.karat,getVendorById(design.vendor)?.pricingsetting?.lossPercentage)}
                    miscCost={design.miscCost}
                    laborCost={design.laborCost}
                    stones={design.stones}
                    updateTotalCost={(cost)=> totalCost=cost}
                   />
                </div>

                {/* Image */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">Images</h3>
                  <img
                    src="https://via.placeholder.com/100x100"
                    alt="Sample"
                    className="w-20 h-20 object-contain"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end text-sm font-medium mt-6">
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => {handleUpdateStatus("declined:red")
                      onClose()
                    }}>
                    Decline
                  </button>
                  <button className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                  onClick={() => {handleUpdateStatus("revision_requested:yellow")
                    onClose()
                  }}>

                    Request Revision
                  </button>
                  
                  <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => {handleUpdateStatus("approved")
                        onClose()
                    }}
                  >
                    Approve And Create Sample
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
