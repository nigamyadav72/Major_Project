import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { productsAPI } from '@/api/services';

interface SearchSuggestion {
  id: number;
  name: string;
  type: 'product' | 'category' | 'brand';
}

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

const SearchSuggestions = ({ query, isVisible, onSelectSuggestion, onClose }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Popular search terms
  const popularSearches = [
    'headphones', 'laptop', 'smartphone', 'camera', 'watch',
    'shoes', 'dress', 'book', 'gaming', 'fitness'
  ];

  useEffect(() => {
    if (!isVisible || !query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // Search for products that match the query
        const response = await productsAPI.search(query.trim(), { page_size: 5 });
        const products = response.data.results || response.data;
        
        const productSuggestions: SearchSuggestion[] = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          type: 'product' as const
        }));

        setSuggestions(productSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, isVisible]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !query.trim()) {
    return null;
  }

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm">Searching...</p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {/* Search suggestions */}
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Products
            </h3>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSelectSuggestion(suggestion.name)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {suggestion.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches
                .filter(term => term.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
                .map((term) => (
                  <button
                    key={term}
                    onClick={() => onSelectSuggestion(term)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Try searching for: headphones, laptop, smartphone</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions; 