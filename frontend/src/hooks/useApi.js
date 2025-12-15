import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';

// Custom hook for API calls with loading states and error handling
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const {
    immediate = true,
    onSuccess,
    onError,
    transform
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      const response = await apiCall(...args);
      
      // Transform data if transformer provided
      const finalData = transform ? transform(response.data) : response.data;
      
      setData(finalData);
      
      if (onSuccess) {
        onSuccess(finalData);
      }
      
      return finalData;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiCall, transform, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  const refetch = useCallback(() => execute(), [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};

// Specialized hook for investment products
export const useInvestmentProducts = (options = {}) => {
  return useApi(
    apiService.getInvestmentProducts,
    [],
    {
      transform: (data) => data.success ? data.products : [],
      ...options
    }
  );
};

// Specialized hook for regular products
export const useProducts = (options = {}) => {
  return useApi(
    apiService.getProducts,
    [],
    {
      transform: (data) => data.success ? data.products : [],
      ...options
    }
  );
};

// Hook for filtered and paginated data
export const useFilteredData = (data, filters, pagination) => {
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);

  useEffect(() => {
    if (!data) return;

    let filtered = data;

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      filtered = data.filter(item => 
        item.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm) ||
        item.title?.toLowerCase().includes(searchTerm) ||
        item.productTitle?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(filtered);

    // Apply pagination
    if (pagination) {
      const { page, itemsPerPage } = pagination;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedData(filtered.slice(startIndex, endIndex));
    } else {
      setPaginatedData(filtered);
    }
  }, [data, filters.category, filters.search, pagination?.page, pagination?.itemsPerPage]);

  return {
    filteredData,
    paginatedData,
    totalItems: filteredData.length,
    totalPages: pagination ? Math.ceil(filteredData.length / pagination.itemsPerPage) : 1
  };
};
