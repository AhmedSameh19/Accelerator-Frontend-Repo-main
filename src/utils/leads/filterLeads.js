import { matchSearchTerm } from '../searchUtils';

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

  // 1. Apply Search Filter
  let filtered = (leads || []).filter((lead) => 
    matchSearchTerm(lead, searchTerm, ['expa_person_id', 'id', 'full_name', 'name', 'email', 'phone'])
  );

  // 2. Apply Date Filter
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

  // 3. Apply Status Filter - prioritize expa_status/status
  if (statusFilter) {
    filtered = filtered.filter((lead) => {
      const currentStatus = normalizeLower(lead.expa_status ?? lead.status);
      const targetStatus = normalizeLower(statusFilter);

      // Direct match if we have a status field
      if (currentStatus) {
        return currentStatus === targetStatus;
      }

      // Fallback: Check if a specific date exists for that status (Legacy OGX)
      const statusDateMapping = {
        applied: 'date_applied',
        accepted: 'date_matched',
        approved: 'date_approved',
        realized: 'date_realized',
        finished: 'experience_end_date',
        completed: 'experience_end_date', // finished/completed are often used interchangeably
      };

      const dateField = statusDateMapping[targetStatus];
      if (dateField) {
        const dateVal = lead[dateField];
        return dateVal && dateVal !== '-' && dateVal !== '';
      }

      // "Open" logic fallback
      if (targetStatus === 'open') {
        const hasNoStatusDates =
          !lead.date_applied &&
          !lead.date_matched &&
          !lead.date_approved &&
          !lead.date_realized &&
          !lead.experience_end_date;
        return hasNoStatusDates;
      }

      // "Rejected" fallback
      if (targetStatus === 'rejected') {
        return normalizeLower(lead.status) === 'rejected';
      }

      return false;
    });
  }

  // 4. Apply Secondary Filters
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

