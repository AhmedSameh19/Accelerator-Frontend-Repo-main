/**
 * Sorting utility functions for leads/realizations tables
 * Provides type-safe comparison helpers and field-specific sorting
 */

/**
 * Safely compare two values as strings
 * Handles null/undefined values gracefully
 * 
 * @param {any} aVal - First value to compare
 * @param {any} bVal - Second value to compare
 * @returns {number} - Comparison result (-1, 0, or 1)
 */
export const safeCompare = (aVal, bVal) => {
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return -1;
  if (bVal == null) return 1;
  
  const aStr = String(aVal);
  const bStr = String(bVal);
  return aStr.localeCompare(bStr);
};

/**
 * Compare two values as numbers
 * Handles NaN values gracefully
 * 
 * @param {any} aVal - First value to compare
 * @param {any} bVal - Second value to compare
 * @returns {number} - Comparison result
 */
export const numericCompare = (aVal, bVal) => {
  const aNum = Number(aVal);
  const bNum = Number(bVal);
  if (isNaN(aNum) && isNaN(bNum)) return 0;
  if (isNaN(aNum)) return -1;
  if (isNaN(bNum)) return 1;
  return aNum - bNum;
};

/**
 * Compare two date values
 * Handles invalid dates gracefully
 * 
 * @param {any} aVal - First date value
 * @param {any} bVal - Second date value
 * @returns {number} - Comparison result
 */
export const dateCompare = (aVal, bVal) => {
  const aDate = aVal ? new Date(aVal) : null;
  const bDate = bVal ? new Date(bVal) : null;
  
  const aValid = aDate && !isNaN(aDate.getTime());
  const bValid = bDate && !isNaN(bDate.getTime());
  
  if (!aValid && !bValid) return 0;
  if (!aValid) return -1;
  if (!bValid) return 1;
  
  return aDate.getTime() - bDate.getTime();
};

/**
 * Calculate days until realization from slot start date
 * 
 * @param {string} slotStartDate - The slot start date
 * @returns {number|string} - Days until realization or '-' if invalid
 */
export const calculateDaysTillRealization = (slotStartDate) => {
  if (!slotStartDate) return '-';
  const today = new Date();
  const slotStart = new Date(slotStartDate);
  
  if (isNaN(slotStart.getTime())) return '-';
  
  const diffTime = slotStart - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Field mappings for sorting - handles both camelCase and snake_case field names
 */
const SORT_FIELD_MAPPINGS = {
  id: (item) => item.id,
  fullName: (item) => item.fullName || item.full_name,
  phone: (item) => item.phone || item.contact_number,
  homeLC: (item) => item.homeLC || item.home_lc_name,
  homeMC: (item) => item.homeMC || item.home_mc_name,
  hostLC: (item) => item.hostLC || item.host_lc_name,
  hostMC: (item) => item.hostMC || item.host_mc_name,
  programme: (item) => item.programme,
  status: (item) => item.status,
  apdDate: (item) => item.apdDate || item.created_at,
  slotStartDate: (item) => item.slotStartDate || item.slot_start_date,
  slotEndDate: (item) => item.slotEndDate || item.slot_end_date,
};

/**
 * Sort data by a given key and order
 * 
 * @param {Array} data - Array of items to sort
 * @param {string} sortKey - Field key to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} - Sorted array (new array, does not mutate original)
 */
export const sortData = (data, sortKey, sortOrder) => {
  if (!Array.isArray(data)) return [];
  
  const orderModifier = sortOrder === 'asc' ? 1 : -1;
  const getFieldValue = SORT_FIELD_MAPPINGS[sortKey] || ((item) => item[sortKey]);
  
  return [...data].sort((a, b) => {
    // Special handling for numeric fields
    if (sortKey === 'id') {
      return numericCompare(getFieldValue(a), getFieldValue(b)) * orderModifier;
    }
    
    // Special handling for days till realization
    if (sortKey === 'daysTillRealization') {
      const aStartDate = a.slotStartDate || a.slot_start_date;
      const bStartDate = b.slotStartDate || b.slot_start_date;
      const aDays = calculateDaysTillRealization(aStartDate);
      const bDays = calculateDaysTillRealization(bStartDate);
      return numericCompare(aDays === '-' ? -1 : aDays, bDays === '-' ? -1 : bDays) * orderModifier;
    }
    
    // Special handling for date fields
    if (sortKey.toLowerCase().includes('date')) {
      return dateCompare(getFieldValue(a), getFieldValue(b)) * orderModifier;
    }
    
    // Default: string comparison
    return safeCompare(getFieldValue(a), getFieldValue(b)) * orderModifier;
  });
};

export default {
  safeCompare,
  numericCompare,
  dateCompare,
  calculateDaysTillRealization,
  sortData,
};
