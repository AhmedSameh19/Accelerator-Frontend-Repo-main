import React from 'react';
import {
  Alert,
  Box,
  Snackbar,
} from '@mui/material';

import OGXBulkAssignDialog from './OGXBulkAssignDialog';
import OGXFiltersCard from './OGXFiltersCard';
import OGXHeaderActions from './OGXHeaderActions';
import OGXLeadDialog from './OGXLeadDialog';
import OGXLeadProfileDialog from './OGXLeadProfileDialog';
import OGXLoadingOverlay from './OGXLoadingOverlay';
import OGXRealizationsTable from './OGXRealizationsTable';

export default function OGXRealizationsView({
  fetchLeads,
  loading,
  selectedLeads,
  handleAssignClick,
  handlePrint,
  handleDateFilterChange,

  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedHostLC,
  setSelectedHostLC,
  selectedLanguage,
  setSelectedLanguage,
  selectedExchangeType,
  setSelectedExchangeType,
  selectedStatus,
  setSelectedStatus,

  uniqueHostMCs,
  uniqueHostLCs,
  uniqueHomeLCs,

  exchangeTypes,
  statuses,

  leads,
  order,
  orderBy,
  handleRequestSort,
  sortData,

  handleSelectAll,
  handleSelectLead,

  handleOpenProfile,

  getCountryCode,
  copyToClipboard,
  calculateDaysTillRealization,
  formatDate,
  getAssignedMember,

  openDialog,
  handleCloseDialog,
  selectedLead,
  newLead,
  handleInputChange,
  countries,
  languages,
  educationLevels,
  handleSaveLead,

  openProfileDialog,
  handleCloseProfile,
  tab,
  setTab,
  prepState,
  setPrepState,
  fileToBase64,

  snackbar,
  setSnackbar,

  bulkAssignDialogOpen,
  handleBulkAssignClose,
  selectedMember,
  setSelectedMember,
  members,
  handleBulkAssignConfirm,
}) {
  return (
    <Box sx={{ position: 'relative', minHeight: '80vh' }}>
      <OGXLoadingOverlay loading={loading} />

      <Box sx={{ p: { xs: 1, sm: 3 }, position: 'relative', minHeight: '80vh' }}>
        <OGXHeaderActions
          loading={loading}
          fetchLeads={fetchLeads}
          selectedLeadsCount={selectedLeads.length}
          onAssignSelected={handleAssignClick}
          onPrint={handlePrint}
          onDateFilterChange={handleDateFilterChange}
        />

        <OGXFiltersCard
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedHostLC={selectedHostLC}
          setSelectedHostLC={setSelectedHostLC}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          selectedExchangeType={selectedExchangeType}
          setSelectedExchangeType={setSelectedExchangeType}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          uniqueHostMCs={uniqueHostMCs}
          uniqueHostLCs={uniqueHostLCs}
          uniqueHomeLCs={uniqueHomeLCs}
     
          exchangeTypes={exchangeTypes}
          statuses={statuses}
        />

        <OGXRealizationsTable
          leads={leads}
          selectedLeads={selectedLeads}
          order={order}
          orderBy={orderBy}
          handleRequestSort={handleRequestSort}
          sortData={sortData}
          handleSelectAll={handleSelectAll}
          handleSelectLead={handleSelectLead}
          handleOpenProfile={handleOpenProfile}
          getCountryCode={getCountryCode}
          copyToClipboard={copyToClipboard}
          calculateDaysTillRealization={calculateDaysTillRealization}
          formatDate={formatDate}
          getAssignedMember={getAssignedMember}
        />

        {/* Add/Edit Lead Dialog */}
        <OGXLeadDialog
          open={openDialog}
          onClose={handleCloseDialog}
          selectedLead={selectedLead}
          newLead={newLead}
          handleInputChange={handleInputChange}
          countries={countries}
          languages={languages}
          educationLevels={educationLevels}
          exchangeTypes={exchangeTypes}
          statuses={statuses}
          onSave={handleSaveLead}
        />

        {/* Lead Profile Dialog */}
        <OGXLeadProfileDialog
          open={openProfileDialog}
          onClose={handleCloseProfile}
          selectedLead={selectedLead}
          tab={tab}
          setTab={setTab}
          prepState={prepState}
          setPrepState={setPrepState}
          fileToBase64={fileToBase64}
          getCountryCode={getCountryCode}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Bulk Assign Dialog */}
        <OGXBulkAssignDialog
          open={bulkAssignDialogOpen}
          onClose={handleBulkAssignClose}
          selectedLeadsCount={selectedLeads.length}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          members={members}
          onConfirm={handleBulkAssignConfirm}
        />
      </Box>
    </Box>
  );
}
