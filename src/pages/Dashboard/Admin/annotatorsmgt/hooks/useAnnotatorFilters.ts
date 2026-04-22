import { useState, useCallback, useRef, useMemo } from "react";
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE, SEARCH_DEBOUNCE_DELAY } from "../constants";

interface UseAnnotatorFiltersProps {
  countryFilter: string;
}

export const useAnnotatorFilters = ({ countryFilter }: UseAnnotatorFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(searchTerm && { search: searchTerm }),
    ...(countryFilter !== "all" && { country: countryFilter })
  }), [currentPage, pageSize, statusFilter, searchTerm, countryFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  }, []);

  // Debounced search for real-time typing
  const handleSearchChange = useCallback((value: string) => {
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
    searchTerm,
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
    setSearchTerm,
    setStatusFilter,
    setCurrentPage,
    setPageSize
  };
};