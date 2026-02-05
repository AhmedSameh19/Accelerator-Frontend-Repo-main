export const filterLeads = ({
  leads,
  searchTerm,
  dateRange,
  statusFilter,
  contactStatusFilter,
  interestedFilter,
  processStatusFilter,
  reasonFilter,
  leadStatusById,
}) => {
  const getLeadId = (lead) => lead?.expa_person_id;

  const normalizeString = (value) => {
    if (value == null) return '';
    return String(value).trim();
  };

  const normalizeLower = (value) => normalizeString(value).toLowerCase();

  // Prefer DB-provided contact/process fields on the lead itself.
  // Fallback to localStorage only for legacy flows where list API does not include them.
  const getLeadContactStatus = (lead) =>
    lead?.contact_status ?? lead?.new_status ?? lead?.contactStatus ?? null;

  const getLeadInterested = (lead) =>
    lead?.interested ?? lead?.is_interested ?? lead?.interestedStatus ?? null;

  const getLeadProcessStatus = (lead) =>
    lead?.process ?? lead?.process_status ?? lead?.processStatus ?? null;

  const getLeadReason = (lead) => lead?.reason ?? lead?.rejection_reason ?? null;

  const getLeadStatusFromMap = (lead) => {
    const id = getLeadId(lead);
    if (!id) return null;
    const map = leadStatusById && typeof leadStatusById === 'object' ? leadStatusById : null;
    return map ? map[String(id)] ?? map[id] ?? null : null;
  };

  const toValidDate = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  let filtered = (leads || []).filter((lead) =>
    String(getLeadId(lead) ?? '').includes(searchTerm) ||
    (lead.full_name && lead.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone && String(lead.phone).includes(searchTerm))
  );

  // Apply date filtering if date range is set
  if (dateRange?.startDate && dateRange?.endDate) {
    const field = dateRange.field || 'created_at'; // default: signup date

    const start = toValidDate(dateRange.startDate);
    const end = toValidDate(dateRange.endDate);

    if (start && end) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((lead) => {
        const leadDate =
          toValidDate(lead?.[field]) ??
          toValidDate(lead?.created_at) ??
          toValidDate(lead?.inserted_at);

        if (!leadDate) return false;
        return leadDate >= start && leadDate <= end;
      });
    }
  }

  // Apply status filtering - map AIESEC API status to our filter values
  if (statusFilter) {
    filtered = filtered.filter((lead) => {
      // New backend shape (expa_status)
      if (lead.expa_status) {
        return String(lead.expa_status).toLowerCase() === String(statusFilter).toLowerCase();
      }

      // iCX leads backend shape (status)
      if (lead.status) {
        return String(lead.status).toLowerCase() === String(statusFilter).toLowerCase();
      }

      const statusDateMapping = {
        applied: 'date_applied',
        accepted: 'date_matched',
        approved: 'date_approved',
        realized: 'date_realized',
        finished: 'experience_end_date',
      };

      const dateField = statusDateMapping[statusFilter];

      if (dateField) {
        const hasDate =
          lead[dateField] && lead[dateField] !== '-' && lead[dateField] !== '';
        return hasDate;
      }

      if (statusFilter === 'open') {
        const hasAnyDate =
          lead.date_applied ||
          lead.date_matched ||
          lead.date_approved ||
          lead.date_realized ||
          lead.experience_end_date;
        const isOpen =
          !hasAnyDate || hasAnyDate === '-' || hasAnyDate === '';
        return isOpen;
      }

      if (statusFilter === 'rejected') {
        return String(lead.status || '').toLowerCase() === 'rejected';
      }

      return false;
    });
  }

  if (contactStatusFilter) {
    filtered = filtered.filter((lead) => {
      const dbValue = getLeadContactStatus(lead);
      const value = dbValue != null && normalizeString(dbValue) !== ''
        ? dbValue
        : getLeadStatusFromMap(lead)?.contact_status;

      if (value == null || normalizeString(value) === '') return false;
      return normalizeLower(value) === normalizeLower(contactStatusFilter);
    });
  }

  if (interestedFilter) {
    filtered = filtered.filter((lead) => {
      const dbValue = getLeadInterested(lead);
      const value = dbValue != null && normalizeString(dbValue) !== ''
        ? dbValue
        : getLeadStatusFromMap(lead)?.interested;

      if (value == null || normalizeString(value) === '') return false;
      return normalizeLower(value) === normalizeLower(interestedFilter);
    });
  }

  if (processStatusFilter) {
    filtered = filtered.filter((lead) => {
      const dbValue = getLeadProcessStatus(lead);
      const value = dbValue != null && normalizeString(dbValue) !== ''
        ? dbValue
        : getLeadStatusFromMap(lead)?.process_status;

      if (value == null || normalizeString(value) === '') return false;
      return normalizeLower(value) === normalizeLower(processStatusFilter);
    });
  }

  if (reasonFilter) {
    filtered = filtered.filter((lead) => {
      const dbValue = getLeadReason(lead);
      const value = dbValue != null && normalizeString(dbValue) !== ''
        ? dbValue
        : getLeadStatusFromMap(lead)?.reason;

      if (value == null || normalizeString(value) === '') return false;
      return normalizeLower(value) === normalizeLower(reasonFilter);
    });
  }

  return filtered;
};

