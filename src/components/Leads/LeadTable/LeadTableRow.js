import React from 'react';
import { TableRow, TableCell, Box, Typography, Avatar, IconButton, Tooltip, Chip, Checkbox } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import { STATUS_COLORS } from './constants';

export default function LeadTableRow({ 
  lead, 
  isSelected, 
  onSelect, 
  onProfileClick,
  theme,
  isICX = false,
  selectionId,
}) {
  const effectiveSelectionId = selectionId ?? (isICX ? lead.application_id : lead.expa_person_id);
  const displayId = isICX ? (lead.application_id ?? lead.expa_person_id) : lead.expa_person_id;
  const leadName = lead.full_name;
  const leadLcName = isICX ? (lead.home_lc_name || lead.host_lc_name) : (lead.host_lc_name || lead.home_lc_name);
  const homeMcName = lead.home_mc_name || lead.home_mc;
  const leadStatus = lead.expa_status || lead.status || '-';
  const assignedMember = lead.assigned_member_name || '-';

  return (
    <TableRow 
      key={effectiveSelectionId}
      hover
      selected={isSelected}
      sx={{ 
        '&:hover': {
          bgcolor: theme.palette.action.hover
        }
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(effectiveSelectionId)}
        />
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
          onClick={() => onProfileClick(lead)}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            {(leadName || 'E')?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="medium"
              sx={{ color: theme.palette.primary.main }}
            >
              {leadName || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {displayId}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>{leadLcName || '-'}</TableCell>
      {isICX ? <TableCell>{homeMcName || '-'}</TableCell> : null}
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lead.phone || '-'}
          {lead.phone && (
            <Tooltip title="Call">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${lead.phone}`;
                }}
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.light
                  }
                }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell>
        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
      </TableCell>
      <TableCell>
        <Chip
          label={leadStatus || '-'}
          color={STATUS_COLORS[leadStatus] || 'default'}
          size="small"
        />
      </TableCell>
      <TableCell>
        {assignedMember && assignedMember !== '-' ? (
          <Chip
            label={assignedMember}
            size="small"
            color="primary"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
        )}
      </TableCell>
    </TableRow>
  );
}

