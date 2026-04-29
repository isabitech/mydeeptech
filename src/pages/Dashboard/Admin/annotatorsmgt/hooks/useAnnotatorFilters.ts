import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE, SEARCH_DEBOUNCE_DELAY } from "../constants";

interface UseAnnotatorFiltersProps {
  countryFilter: string;
  languageFilter?: string;
}

export const useAnnotatorFilters = ({ countryFilter, languageFilter }: UseAnnotatorFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(""); // Immediate input value for UI
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset to page 1 when country or language filter changes
  useEffect(() => {
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, [countryFilter, languageFilter]);

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(searchTerm && { search: searchTerm }),
    ...(countryFilter !== "all" && { country: countryFilter }),
    ...(languageFilter && languageFilter !== "all" && { language: languageFilter })
  }), [currentPage, pageSize, statusFilter, searchTerm, countryFilter, languageFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setInputValue(value);
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, []);

  // Debounced search for real-time typing
  const handleSearchChange = useCallback((value: string) => {
    // Update input value immediately for responsive UI
    setInputValue(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is cleared, update immediately
    if (!value) {
      setSearchTerm("");
      setCurrentPage(DEFAULT_CURRENT_PAGE);
      return;
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(DEFAULT_CURRENT_PAGE);
    }, SEARCH_DEBOUNCE_DELAY);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, []);

  const handlePagination = useCallback((page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setInputValue("");
    setStatusFilter("all");
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, []);

  // Cleanup timeout
  const cleanup = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  return {
    // State
    searchTerm: inputValue, // Use inputValue for immediate UI updates
    statusFilter,
    currentPage,
    pageSize,
    queryParams,
    
    // Handlers
    handleSearch,
    handleSearchChange,
    handleStatusFilter,
    handlePagination,
    resetFilters,
    cleanup,

    // Direct setters for external control
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      setInputValue(value);
    },
    setStatusFilter,
    setCurrentPage,
    setPageSize
  };
};