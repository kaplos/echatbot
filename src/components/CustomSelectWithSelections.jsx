import React, { useState, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSupabase } from "./SupaBaseProvider";

function CustomSelectWithSelections({ onSelect, version, isOpen, close, selected }) {
  const supabase = useSupabase();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(selected || []);

  const filteredCollections = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFromDatabase();
      console.log(data, 'data from model');
      setOptions(data);
      console.log(data, version);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleCheckboxChange = (option) => {
    setSelectedOptions(prev => {
      if (prev.some(selected => selected.id === option.id)) {
        return prev.filter(selected => selected.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleApplySelection = () => {
    onSelect(selectedOptions);
    setSelectedOptions([]);
    close();
  };

  const getFromDatabase = async () => {
    const { data, error } = await supabase
      .from(`${version === 'collection' ? 'Ideas' : version}`)
      .select('*');

    if (error) {
      console.error(`Error fetching ${version}:`, error);
    }

    return data;
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10 " onClose={close}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg  transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Select {version}
                  </Dialog.Title>
                  <button onClick={close} className="text-gray-500 hover:text-gray-700">
                    X
                  </button>
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>

                <ul className="max-h-40 overflow-y-auto gap-1  flex flex-col mt-2">
                  {filteredCollections.map((collection, index) => {
                    const isSelected = selected.some(selected => selected.name === collection.name);
                    return (
                      <li
                        key={index}
                        onClick={() => {
                          console.log(`Selected: ${collection.name}`);
                          handleCheckboxChange(collection);
                        }}
                        className={`p-2 flex flex-row hover:bg-gray-100 rounded-sm ${isSelected ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isSelected}
                          checked={isSelected || selectedOptions.some(selected => selected.name === collection.name)}
                          onChange={() => handleCheckboxChange(collection)}
                          className="mr-2"
                        />
                        <span className="flex flex-col">
                          {collection.name}
                          {isSelected && <p>This item has already been added</p>}
                        </span>
                      </li>
                    );
                  })}
                  {filteredCollections.length === 0 && (
                    <li className="p-2 text-gray-500">{`No ${version} Found`}</li>
                  )}
                </ul>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleApplySelection}
                  >
                    Apply
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

export default CustomSelectWithSelections;
