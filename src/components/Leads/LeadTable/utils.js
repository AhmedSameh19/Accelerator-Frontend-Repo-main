// Helper function to get assigned member ID from lead
export function getAssignedMemberId(lead) {
  if (!lead) return null;
  
  // Try different possible field names
  if (lead.assigned_member_id) return String(lead.assigned_member_id);
  if (lead.assigned_to) return String(lead.assigned_to);
  if (lead.assigned_member) return String(lead.assigned_member);
  
  return null;
}

// Helper function to get assigned member name (if available)
export function getAssignedMember(leadId) {
  // This might need to lookup from members array
  // For now, return null and let the component handle it
  return null;
}

