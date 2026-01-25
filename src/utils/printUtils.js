/**
 * Print utility functions for realizations tables
 */

import { formatDate, getCountryCode } from '../constants/ogxRealizationsConstants';
import { calculateDaysTillRealization } from './sortUtils';

/**
 * Get chip background color based on label
 * 
 * @param {string} label - Chip label text
 * @returns {string} - CSS color value
 */
const getChipColor = (label) => {
  const colorMap = {
    gv: '#F85A40',
    gta: '#0CB9C1',
    gte: '#F48924',
    approved: '#4caf50',
    realized: '#1976d2',
    finished: '#ffc107',
    completed: '#ff9800',
    rejected: '#f44336',
    'on hold': '#ff9800',
    'approval_broken': '#f44336',
    'realization_broken': '#f44336',
  };
  
  return colorMap[label?.toLowerCase()] || '#e0e0e0';
};

/**
 * Generate chip HTML for print
 * 
 * @param {string} label - Chip label
 * @returns {string} - HTML string
 */
const generateChipHtml = (label) => {
  const bgColor = getChipColor(label);
  return `
    <span style="
      background-color: ${bgColor} !important;
      color: white !important;
      border: none !important;
      padding: 4px 8px !important;
      border-radius: 16px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center !important;
      margin: 1px !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    ">
      ${label || '-'}
    </span>
  `;
};

/**
 * Generate print table HTML for leads
 * 
 * @param {Array} leads - Leads to print
 * @returns {string} - HTML string
 */
const generatePrintTableHtml = (leads) => {
  const headerStyle = `
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
    color: white !important;
    padding: 8px !important;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none !important;
    line-height: 1.1;
  `;

  const cellStyle = `
    padding: 8px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    font-size: 12px !important;
  `;

  const headers = [
    'Name',
    'Phone',
    'Home LC',
    'Home MC',
    'Host MC',
    'Host LC',
    'Product',
    'Status',
    'Days Till',
    'APD Date',
    'Slot Start',
    'Assigned To',
  ];

  const rows = leads.map((lead, idx) => {
    const slotStartDate = lead.slotStartDate || lead.slot_start_date;
    const apdDate = lead.apdDate || lead.created_at;
    const rowBg = idx % 2 === 0 ? '#f5f5f5' : 'white';
    
    return `
      <tr style="background: ${rowBg};">
        <td style="${cellStyle}">${lead.fullName || lead.full_name || '-'}</td>
        <td style="${cellStyle}">${getCountryCode(lead.homeMC || lead.home_mc_name)} ${lead.phone || lead.contact_number || '-'}</td>
        <td style="${cellStyle}">${lead.homeLC || lead.home_lc_name || '-'}</td>
        <td style="${cellStyle}">${lead.homeMC || lead.home_mc_name || '-'}</td>
        <td style="${cellStyle}">${lead.hostMC || lead.host_mc_name || '-'}</td>
        <td style="${cellStyle}">${lead.hostLC || lead.host_lc_name || '-'}</td>
        <td style="${cellStyle}">${generateChipHtml(lead.programme)}</td>
        <td style="${cellStyle}">${generateChipHtml(lead.status)}</td>
        <td style="${cellStyle}">${calculateDaysTillRealization(slotStartDate)}</td>
        <td style="${cellStyle}">${formatDate(apdDate)}</td>
        <td style="${cellStyle}">${formatDate(slotStartDate)}</td>
        <td style="${cellStyle}">${lead.assigned_member_name || '-'}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OGX Realizations Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          table { font-size: 10px; }
        }
      </style>
    </head>
    <body>
      <h2 style="color: #1976d2; margin-bottom: 20px;">OGX Realizations Report</h2>
      <p style="color: #666; margin-bottom: 10px;">Generated: ${new Date().toLocaleString()}</p>
      <p style="color: #666; margin-bottom: 20px;">Total Records: ${leads.length}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th style="${headerStyle}">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;
};

/**
 * Print leads data
 * 
 * @param {Array} leads - Leads to print
 * @param {Array} selectedIds - Optional array of selected lead IDs to filter
 */
export const printLeads = (leads, selectedIds = []) => {
  // Filter leads if selection provided
  let leadsToPrint = leads;
  
  if (selectedIds.length > 0) {
    leadsToPrint = leads.filter(lead => {
      const leadExpaId = lead?.expa_person_id || lead?.expaPerson_id || lead.id;
      return selectedIds.includes(leadExpaId);
    });
  }

  if (leadsToPrint.length === 0) {
    alert('No leads selected for printing');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for this website to print');
    return;
  }

  printWindow.document.write(generatePrintTableHtml(leadsToPrint));
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export default {
  printLeads,
  getChipColor,
  generateChipHtml,
  generatePrintTableHtml,
};
