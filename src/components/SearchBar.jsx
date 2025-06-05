import React, { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../components/SupaBaseProvider';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchBar = () => {
  const { supabase } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm('');
        setItems(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchItems = async (searchTerm = '') => {
    setLoading(true);
    setError(null);

    try {
      const { data: samples, error: samplesError } = await supabase
        .from('samples')
        .select('*')
        .or(`styleNumber.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);

      if (samplesError) throw samplesError;

      const { data: ideas, error: ideasError } = await supabase
        .from('Ideas')
        .select('*')
        .ilike('title', `%${searchTerm}%`);

      if (ideasError) throw ideasError;

      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .or(`buyer.ilike.%${searchTerm}%`);

      if (quotesError) throw quotesError;
      let quotesById = [];

      if (!isNaN(parseInt(searchTerm))) {
        const { data, error: quotesError2 } = await supabase
          .from('quotes')
          .select('*')
          .eq("id", Number(searchTerm));

        if (quotesError2) throw quotesError2;

        quotesById = data || [];
      }

      // const { data: vendors, error: vendorsError } = await supabase
      //   .from('vendors')
      //   .select('*')
      //   .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

      // if (vendorsError) throw vendorsError;

      const { data: designs, error: designsError } = await supabase
        .from('designs')
        .select('*')
        .or(`name.ilike.%${searchTerm}%`);

      if (designsError) throw designsError;

      const combinedResults = [
        ...samples.map((sample) => ({
          ...sample,
          table: 'samples',
          linkTo: `/samples?sampleId=${sample.id}`,
          display: sample.name || sample.styleNumber
        })),
        ...ideas.map((idea) => ({
          ...idea,
          table: 'ideas',
          linkTo: `/ideas?ideaId=${idea.id}`,
          display: idea.title
        })),
        ...quotes.map((quote) => ({
          ...quote,
          table: 'quotes',
          linkTo: `/ViewQuote?quote=${quote.quoteNumber}`,
          display: quote.buyer || quote.quoteNumber
        })),
        ...quotesById.map((quote) => ({
          ...quote,
          table: 'quotes',
          linkTo: `/ViewQuote?quote=${quote.quoteNumber}`,
          display: quote.buyer || `Quote: ${quote.id}`
        })),
        // ...vendors.map((vendor) => ({
        //   ...vendor,
        //   table: 'vendors',
        //   linkTo: '',
        //   display: vendor.name || vendor.email
        // })),
        ...designs.map((design) => ({
          ...design,
          table: 'designs',
          linkTo: `/designs?designId=${design.id}`,
          display: design.name
        }))
      ];

      setItems(combinedResults.filter((item) => item.display));
    } catch (err) {
      setError('Error fetching search results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length === 0) return;

    const delayDebounce = setTimeout(() => {
      fetchItems(searchTerm);
    }, 300); // Adjust debounce delay (ms) as needed

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
      </div>

      {searchTerm.length > 0 && items && (
        <ul className="absolute z-10 mt-2 w-full border rounded-md divide-y bg-white shadow-lg max-h-64 overflow-auto">
          {items && items.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.linkTo}
                    onClick={(e)=>{
                      setItems(null)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {item.display}
                    <span className="ml-2 text-xs text-gray-400">({item.table})</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : !loading && (
            <div className="p-2 text-sm text-gray-500">No results found</div>
          )}
        </ul>
      )}

      {/* {loading && <p className="text-sm text-gray-500 mt-1">Loading...</p>} */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SearchBar;
