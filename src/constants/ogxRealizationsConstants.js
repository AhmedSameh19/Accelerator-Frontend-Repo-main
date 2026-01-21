// Shared constants/helpers for OGX realizations pages.

export const countries = [
  'Egypt',
  'Morocco',
  'Tunisia',
  'Algeria',
  'Libya',
  'Sudan',
  'Other'
];

export const languages = [
  'Arabic',
  'English',
  'French',
  'Spanish',
  'German',
  'Other'
];

export const educationLevels = [
  'High School',
  'Bachelor',
  'Master',
  'PhD',
  'Other'
];

export const exchangeTypes = [
  'GV',
  'GTa',
  'GTe'
];

export const statuses = [
  'Approved',
  'Realized',
  'Finished',
  'Completed',
  'Approval_broken',
  'Realization_broken'
];

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const getCountryCode = (homeMC) => {
  const countryCodes = {
    Egypt: '+20',
    Morocco: '+212',
    Tunisia: '+216',
    Algeria: '+213',
    Libya: '+218',
    Sudan: '+249',
    Other: '+'
  };
  return countryCodes[homeMC] || '+';
};

export const getUniqueHomeMCs = (leads) => {
  const uniqueMCs = new Set((leads || []).map((lead) => lead.homeMC).filter(Boolean));
  return Array.from(uniqueMCs).sort();
};

export const getUniqueHomeLCs = (leads) => {
  const uniqueLCs = new Set((leads || []).map((lead) => lead.homeLC).filter(Boolean));
  return Array.from(uniqueLCs).sort();
};

export const getUniqueHostMCs = (leads) => {
  const uniqueMCs = new Set((leads || []).map((lead) => lead.hostMC).filter(Boolean));
  return Array.from(uniqueMCs).sort();
};

export const getUniqueHostLCs = (leads) => {
  const uniqueLCs = new Set((leads || []).map((lead) => lead.hostLC).filter(Boolean));
  return Array.from(uniqueLCs).sort();
};
