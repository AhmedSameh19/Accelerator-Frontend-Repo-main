import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

import { getProgrammeChipSx, getStatusChipSx } from './ogxChipStyles';

export default function OGXRealizationsTable({
  leads,
  selectedLeads,
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
}) {
  const theme = useTheme();

  return (
    <Card sx={{ mb: { xs: 2, sm: 3 } }}>
      <CardContent sx={{ p: { xs: 1, sm: 2 }, overflowX: 'auto' }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 1200, sm: 1400 },
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedLeads.length > 0 && selectedLeads.length < leads.length
                    }
                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'fullName'}
                    direction={orderBy === 'fullName' ? order : 'asc'}
                    onClick={() => handleRequestSort('fullName')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'phone'}
                    direction={orderBy === 'phone' ? order : 'asc'}
                    onClick={() => handleRequestSort('phone')}
                  >
                    Phone Number
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'homeLC'}
                    direction={orderBy === 'homeLC' ? order : 'asc'}
                    onClick={() => handleRequestSort('homeLC')}
                  >
                    Home LC
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'homeMC'}
                    direction={orderBy === 'homeMC' ? order : 'asc'}
                    onClick={() => handleRequestSort('homeMC')}
                  >
                    Home MC
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'hostMC'}
                    direction={orderBy === 'hostMC' ? order : 'asc'}
                    onClick={() => handleRequestSort('hostMC')}
                  >
                    Host MC
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'hostLC'}
                    direction={orderBy === 'hostLC' ? order : 'asc'}
                    onClick={() => handleRequestSort('hostLC')}
                  >
                    Host LC
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'programme'}
                    direction={orderBy === 'programme' ? order : 'asc'}
                    onClick={() => handleRequestSort('programme')}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'daysTillRealization'}
                    direction={orderBy === 'daysTillRealization' ? order : 'asc'}
                    onClick={() => handleRequestSort('daysTillRealization')}
                  >
                    Days till Realization
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'apdDate'}
                    direction={orderBy === 'apdDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('apdDate')}
                  >
                    Date Approved
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'slotStartDate'}
                    direction={orderBy === 'slotStartDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('slotStartDate')}
                  >
                    Expected Realization date
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  Assigned Member
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No EPs found. Adjust your search criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortData(leads, orderBy, order).map((lead) => (
                  <TableRow
                    key={lead.id}
                    hover
                    onClick={() => handleOpenProfile(lead)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectLead(lead.id);
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: { xs: 24, sm: 32 },
                            height: { xs: 24, sm: 32 },
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {lead.fullName?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{lead.fullName}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {getCountryCode(lead.homeMC)} {lead.phone}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(lead.phone, 'Phone Number', lead);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{lead.homeLC}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{lead.homeMC}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{lead.hostMC}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{lead.hostLC}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Chip
                        label={lead.programme}
                        sx={{
                          ...getProgrammeChipSx(lead.programme),
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Chip
                        label={lead.status}
                        sx={{
                          ...getStatusChipSx(lead.status),
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          px: 2,
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">
                        {calculateDaysTillRealization(lead.apdDate, lead.slotStartDate)}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{formatDate(lead.apdDate)}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography variant="body2">{formatDate(lead.slotStartDate)}</Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 2 },
                      }}
                    >
                      {getAssignedMember(lead.id) ? (
                        <Chip
                          label={getAssignedMember(lead.id) || 'Unknown'}
                          size="small"
                          color="primary"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
