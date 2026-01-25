/**
 * Hook for table sorting state management
 */

import { useState, useCallback } from 'react';
import { sortData as sortDataUtil } from '../../utils/sortUtils';

/**
 * Custom hook for table sorting
 * 
 * @param {Object} options - Hook options
 * @param {string} options.defaultOrderBy - Default field to sort by
 * @param {string} options.defaultOrder - Default sort order ('asc' or 'desc')
 * @returns {Object} - Sort state and actions
 */
export function useTableSort({ defaultOrderBy = 'id', defaultOrder = 'asc' } = {}) {
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [order, setOrder] = useState(defaultOrder);

  /**
   * Handle sort request (toggle direction if same column, reset to asc if different)
   */
  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  /**
   * Sort data using current sort state
   */
  const sortData = useCallback((data) => {
    return sortDataUtil(data, orderBy, order);
  }, [orderBy, order]);

  /**
   * Reset sort to defaults
   */
  const resetSort = useCallback(() => {
    setOrderBy(defaultOrderBy);
    setOrder(defaultOrder);
  }, [defaultOrderBy, defaultOrder]);

  /**
   * Set specific sort configuration
   */
  const setSortConfig = useCallback((newOrderBy, newOrder = 'asc') => {
    setOrderBy(newOrderBy);
    setOrder(newOrder);
  }, []);

  return {
    order,
    orderBy,
    handleRequestSort,
    sortData,
    resetSort,
    setSortConfig,
  };
}

export default useTableSort;
