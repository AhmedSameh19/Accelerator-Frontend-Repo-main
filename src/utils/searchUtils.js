/**
 * Normalizes a string by trimming and converting to lowercase.
 * @param {string|number} value 
 * @returns {string}
 */
const normalize = (value) => (value == null ? '' : String(value).trim().toLowerCase());

/**
 * Normalizes a phone number by removing all non-numeric characters.
 * @param {string|number} phone 
 * @returns {string}
 */
const normalizePhone = (phone) => (phone == null ? '' : String(phone).replace(/\D/g, ''));

/**
 * Checks if an item matches a search term across specified fields.
 * 
 * @param {Object} item The item to check
 * @param {string} searchTerm The search term from the user
 * @param {string[]} fields Array of field names to check on the item
 * @returns {boolean} True if any field matches the search term
 */
export const matchSearchTerm = (item, searchTerm, fields = []) => {
  if (!searchTerm || typeof searchTerm !== 'string') return true;
  
  const term = normalize(searchTerm);
  if (!term) return true;

  const phoneTerm = normalizePhone(searchTerm);

  return fields.some((field) => {
    const value = item[field];
    if (value == null) return false;

    // Special handling for phone fields
    if (field.toLowerCase().includes('phone') || field.toLowerCase().includes('contact')) {
      const normalizedValue = normalizePhone(value);
      // Match if the phone term is contained in normalized value or vice versa
      return (phoneTerm && normalizedValue.includes(phoneTerm)) || normalize(value).includes(term);
    }

    // Default string matching
    return normalize(value).includes(term);
  });
};
