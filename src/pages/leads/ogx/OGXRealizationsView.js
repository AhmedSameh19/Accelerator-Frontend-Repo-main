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
  selectedExchangeType,
  setSelectedExchangeType,
  selectedStatus,
  setSelectedStatus,
  selectedAssignedMember,
  setSelectedAssignedMember,

  uniqueHostMCs,
  uniqueHostLCs,

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

  bulkAssignDialogOpen,
  handleBulkAssignClose,
  selectedMember,
  setSelectedMember,
  members,
  handleBulkAssignConfirm,
  bulkAssignLoading,
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
          selectedExchangeType={selectedExchangeType}
          setSelectedExchangeType={setSelectedExchangeType}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedAssignedMember={selectedAssignedMember}
          setSelectedAssignedMember={setSelectedAssignedMember}
          uniqueHostMCs={uniqueHostMCs}
          uniqueHostLCs={uniqueHostLCs}
          exchangeTypes={exchangeTypes}
          statuses={statuses}
          members={members}
        />

        <OGXRealizationsTable
          leads={leads}
          fetchLeads={fetchLeads}
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
        {/* Bulk Assign Dialog */}
        <OGXBulkAssignDialog
          open={bulkAssignDialogOpen}
          onClose={handleBulkAssignClose}
          selectedLeadsCount={selectedLeads.length}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          members={members}
          onConfirm={handleBulkAssignConfirm}
          loading={bulkAssignLoading}
        />
      </Box>
    </Box>
  );
}
