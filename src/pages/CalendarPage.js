/**
 * Calendar — visits and events, Google Calendar OAuth/events, and Market Research follow-up sync.
 */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip,
  FormControl, InputLabel, Select, Chip, Snackbar, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { followUpStatusEmitter } from './MarketResearchPage';
import leadsApi from '../api/services/leadsApi';
import marketResearchAPI from '../api/services/marketResearchAPI';
import calendarApi from '../api/services/calendarApi';
// Create a simple event emitter if the import fails
const createEventEmitter = () => {
  const listeners = {};
  return {
    on: (event, callback) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off: (event, callback) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    },
    emit: (event, data) => {
      if (!listeners[event]) return;
      listeners[event].forEach(callback => callback(data));
    }
  };
};

// Use the imported emitter or create a fallback
const emitter = followUpStatusEmitter || createEventEmitter();

// Sample events data
const initialEvents = [
  {
    id: '1',
    title: 'University Booth',
    description: 'Recruitment booth at Cairo University',
    date: '2025-04-20',
    time: '10:00',
    duration: 180, // minutes
    type: 'recruitment',
    assignedTo: ['Ahmed', 'Laila']
  },
  {
    id: '2',
    title: 'Lead Follow-up',
    description: 'Follow up with leads from the career fair',
    date: '2025-04-23',
    time: '13:00',
    duration: 120,
    type: 'follow-up',
    assignedTo: ['Mohamed']
  },
  {
    id: '3',
    title: 'Information Session',
    description: 'Global volunteer information session',
    date: '2025-04-25',
    time: '16:00',
    duration: 90,
    type: 'info-session',
    assignedTo: ['Laila', 'Omar']
  },
  {
    id: '4',
    title: 'Team Meeting',
    description: 'Weekly B2C team meeting',
    date: '2025-04-17',
    time: '15:00',
    duration: 60,
    type: 'meeting',
    assignedTo: ['Ahmed', 'Laila', 'Mohamed', 'Omar']
  },
  {
    id: '5',
    title: 'Marketing Campaign Launch',
    description: 'Social media campaign launch for summer exchange',
    date: '2025-04-18',
    time: '09:00',
    duration: 240,
    type: 'marketing',
    assignedTo: ['Sara']
  }
];

// Sample team members
const teamMembers = [
  'Ahmed', 'Laila', 'Mohamed', 'Omar', 'Sara'
];

function EventForm({ open, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'meeting',
    assignedTo: []
  });

  React.useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        description: initial.description || '',
        date: initial.date || '',
        time: initial.time || '',
        duration: initial.duration || 60,
        type: initial.type || 'meeting',
        assignedTo: initial.assignedTo || []
      });
    } else {
      setForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        type: 'meeting',
        assignedTo: []
      });
    }
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // // If this is a follow-up event, update the follow-up status in localStorage
    // if (initial?.id?.startsWith('followup-')) {
    //   const followUpId = initial.followUpId;
    //   if (!followUpId) {
    //     console.error('No followUpId found in event:', initial);
    //     return;
    //   }

    //   const storageKey = initial.entityType === 'lead' 
    //     ? `lead_followups_${initial.entityId}`
    //     : `company_followups_${initial.entityId}`;
      
    //   try {
    //     const followUps = JSON.parse(localStorage.getItem(storageKey) || '[]');
    //     const updatedFollowUps = followUps.map(f => 
    //       f.id === followUpId ? { ...f, status: 'completed' } : f
    //     );
    //     localStorage.setItem(storageKey, JSON.stringify(updatedFollowUps));
        
    //     // Emit event for real-time sync
    //     emitter.emit('statusChange', {
    //       followupId,
    //       newStatus: 'completed',
    //       companyId: initial.entityId
    //     });
    //   } catch (err) {
    //     console.error('Error updating follow-up status:', err);
    //   }
    // }

    if (initial?.id?.startsWith('followup-') && initial?.entityId) {
      const id = initial.id.split('-')[1];
      try {
        const updatedFollowUp = await leadsApi.updateFollowUp(initial.entityId, id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('Follow-up status updated successfully', updatedFollowUp);
      } catch (error) {
        console.error('Error updating follow-up status:', error);
      }
    }
    onSave(form);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        {initial?.id?.startsWith('followup-') 
          ? 'Complete Follow-up'
          : (initial ? 'Edit Event' : 'Add New Event')}
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
            disabled={initial?.id?.startsWith('followup-')}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            disabled={initial?.id?.startsWith('followup-')}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          />
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={initial?.id?.startsWith('followup-')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={initial?.id?.startsWith('followup-')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Event Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                fullWidth
                disabled={initial?.id?.startsWith('followup-')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="recruitment">Recruitment</MenuItem>
                <MenuItem value="info-session">Info Session</MenuItem>
                <MenuItem value="follow-up">Follow-up</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                fullWidth
                InputProps={{ inputProps: { min: 15, step: 15 } }}
                disabled={initial?.id?.startsWith('followup-')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              />
            </Grid>
          </Grid>
          <FormControl fullWidth>
            <InputLabel id="assigned-to-label">Assigned Team Members</InputLabel>
            <Select
              labelId="assigned-to-label"
              name="assignedTo"
              multiple
              value={form.assignedTo}
              onChange={handleChange}
              label="Assigned Team Members"
              disabled={initial?.id?.startsWith('followup-')}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {teamMembers.map((member) => (
                <MenuItem key={member} value={member}>
                  {member}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color={initial?.id?.startsWith('followup-') ? 'success' : 'primary'}
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {initial?.id?.startsWith('followup-') ? 'Complete Follow-up' : 'Save Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CalendarGrid({ events, month, year, onEventClick, onDeleteEvent }) {
  // Get days in month and first day of month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Create calendar grid
  const days = [];
  const eventsByDay = {};
  
  // Group events by day
  events.forEach(event => {
    const eventDate = new Date(event.date);
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      const day = eventDate.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });
  
  // Fill in empty cells before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<Box key={`empty-${i}`} className="day empty"></Box>);
  }
  
  // Fill in days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay[day] || [];
    const isToday = new Date().getDate() === day && 
                   new Date().getMonth() === month && 
                   new Date().getFullYear() === year;
                   
    days.push(
      <Box 
        key={`day-${day}`} 
        className="day" 
        sx={{
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 1,
          p: { xs: 0.5, sm: 1 },
          minHeight: { xs: 80, sm: 120 },
          backgroundColor: isToday ? 'rgba(3, 126, 243, 0.1)' : 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: isToday ? 'bold' : 'normal',
            color: isToday ? 'primary.main' : 'text.primary',
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {day}
        </Typography>
        
        {dayEvents.slice(0, 3).map(event => {
          const typeColors = {
            meeting: '#037ef3',
            recruitment: '#30C39E',
            'info-session': '#F85A40',
            'follow-up': '#9c27b0',
            marketing: '#FFC845',
            visit: '#FF5722',
            other: '#607d8b'
          };
          
          const isFollowUp = typeof event.id === 'string' && event.id.startsWith('followup-');
          const isVisit = event.type === 'visit';
          const statusColor = event.status === 'completed' ? '#4caf50' : '#ff9800';
          
          return (
            <Box 
              key={event.id}
              sx={{
                p: { xs: 0.5, sm: 0.75 },
                mb: { xs: 0.25, sm: 0.5 },
                borderRadius: 1,
                backgroundColor: isFollowUp ? statusColor : (isVisit ? typeColors.visit : (typeColors[event.type] || '#607d8b')),
                color: 'white',
                fontSize: { xs: '0.65rem', sm: '0.8rem' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                border: isFollowUp ? '1px dashed rgba(255, 255, 255, 0.5)' : 'none',
                boxShadow: isVisit ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
              }}
              onClick={() => onEventClick(event)}
            >
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                {event.time.substring(0, 5)} {event.title}
                {isFollowUp && (
                  <Chip
                    label={event.status}
                    size="small"
                    sx={{
                      ml: 1,
                      height: { xs: '12px', sm: '16px' },
                      fontSize: { xs: '0.5rem', sm: '0.6rem' },
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                )}
                {isVisit && (
                  <Chip
                    label="Visit"
                    size="small"
                    sx={{
                      ml: 1,
                      height: { xs: '12px', sm: '16px' },
                      fontSize: { xs: '0.5rem', sm: '0.6rem' },
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                )}
              </Typography>
              <Tooltip title="Delete Event">
                <IconButton 
                  size="small" 
                  sx={{ color: 'white', p: { xs: 0.1, sm: 0.25 } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event.id);
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
        
        {dayEvents.length > 3 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
            +{dayEvents.length - 3} more
          </Typography>
        )}
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: 'repeat(7, 1fr)', sm: 'repeat(7, 1fr)' },
      gap: { xs: 0.5, sm: 1 },
      mt: 2
    }}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <Box key={day} sx={{ textAlign: 'center', fontWeight: 'bold', p: { xs: 0.5, sm: 1 } }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{day}</Typography>
        </Box>
      ))}
      {days}
    </Box>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Calendar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            Something went wrong loading the calendar.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {this.state.error?.message}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

const CALENDAR_PUSHED_VISITS_KEY = 'calendar_pushed_google_visit_ids';
const CALENDAR_PUSHED_FOLLOWUPS_KEY = 'calendar_pushed_google_followup_ids';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleMessage, setGoogleMessage] = useState(null);

  // Handle Google OAuth callback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleParam = params.get('google');
    if (googleParam === 'connected') {
      setGoogleConnected(true);
      setGoogleMessage('Google Calendar connected');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (googleParam === 'error') {
      setGoogleMessage(params.get('message') || 'Google Calendar connection failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Load events from localStorage
  useEffect(() => {
    try {
      const loadEvents = () => {
        // Load calendar events
        const calendarEvents = JSON.parse(localStorage.getItem('calendar_events') || '[]');
        
        // Load follow-ups
        const allFollowUps = [];
        
        // Load company follow-ups
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('company_followups_')) {
            try {
              const companyId = key.replace('company_followups_', '');
              const companyFollowUps = JSON.parse(localStorage.getItem(key) || '[]');
              
              // Convert follow-ups to calendar events
              const followUpEvents = companyFollowUps.map(followUp => {
                // Parse the date string
                const followUpDate = new Date(followUp.date);
                const dateStr = followUpDate.toISOString().split('T')[0];
                const timeStr = followUpDate.toTimeString().split(' ')[0].substring(0, 5);
                
                return {
                  id: `followup-${followUp.id}`,
                  title: followUp.title || 'Follow-up',
                  description: followUp.text || '',
                  date: dateStr,
                  time: timeStr,
                  duration: 60, // Default duration for follow-ups
                  type: 'follow-up',
                  assignedTo: [followUp.author || 'Current User'],
                  followUpId: followUp.id,
                  entityId: followUp.entityId,
                  entityType: 'company',
                  status: followUp.status || 'pending'
                };
              });
              
              allFollowUps.push(...followUpEvents);
            } catch (err) {
              console.error('Error loading company follow-ups:', err);
            }
          }
        }
        
        // Load lead follow-ups
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('lead_followups_')) {
            try {
              const leadId = key.replace('lead_followups_', '');
              const leadFollowUps = JSON.parse(localStorage.getItem(key) || '[]');
              
              // Convert follow-ups to calendar events
              const followUpEvents = leadFollowUps.map(followUp => {
                // Parse the date string
                const followUpDate = new Date(followUp.date);
                const dateStr = followUpDate.toISOString().split('T')[0];
                const timeStr = followUpDate.toTimeString().split(' ')[0].substring(0, 5);
                
                return {
                  id: `followup-${followUp.id}`,
                  title: followUp.title || 'Follow-up',
                  description: followUp.text || '',
                  date: dateStr,
                  time: timeStr,
                  duration: 60, // Default duration for follow-ups
                  type: 'follow-up',
                  assignedTo: [followUp.author || 'Current User'],
                  followUpId: followUp.id,
                  entityId: followUp.entityId,
                  entityType: 'lead',
                  status: followUp.status || 'pending'
                };
              });
              
              allFollowUps.push(...followUpEvents);
            } catch (err) {
              console.error('Error loading lead follow-ups:', err);
            }
          }
        }
        
        // Update events state with all events
        setEvents(prev => {
          // Remove existing follow-up and visit events
          const nonDynamicEvents = prev.filter(event => 
            !event.id.startsWith('followup-') && event.type !== 'visit'
          );
          return [...nonDynamicEvents, ...calendarEvents, ...allFollowUps];
        });
      };

      loadEvents();
    } catch (err) {
      console.error('Error in loadEvents:', err);
      setError(err);
    }
  }, []);

  // Subscribe to follow-up status changes
  useEffect(() => {
    const handleFollowUpStatusChange = ({ followupId, newStatus }) => {
      setEvents(prev => prev.map(event => 
        event.id === `followup-${followupId}` ? { ...event, status: newStatus } : event
      ));
    };

    emitter.on('statusChange', handleFollowUpStatusChange);
    return () => {
      emitter.off('statusChange', handleFollowUpStatusChange);
    };
  }, []);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddClick = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEventClick = (event) => {
    setEditing(event);
    setFormOpen(true);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const handleFormSave = async (formData) => {
    // Push new events to Google Calendar when connected so they sync (e.g. to mobile)
    if (googleConnected && !editing && formData.title && formData.date && formData.time) {
      try {
        const timeStr = formData.time.length === 5 ? formData.time + ':00' : formData.time;
        const start = new Date(formData.date + 'T' + timeStr);
        const end = new Date(start.getTime() + (Number(formData.duration) || 60) * 60 * 1000);
        await calendarApi.createGoogleEvent(
          formData.title,
          start.toISOString(),
          end.toISOString(),
          formData.description || ''
        );
      } catch (err) {
        console.error('Failed to sync event to Google Calendar:', err);
        setGoogleMessage('Event saved locally but failed to sync to Google Calendar');
      }
    }
    if (editing) {
      setEvents(prev => prev.map(event =>
        event.id === editing.id ? { ...event, ...formData } : event
      ));
    } else {
      const newEvent = {
        id: String(Math.max(0, ...events.map(e => parseInt(e.id) || 0)) + 1),
        ...formData
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setFormOpen(false);
    setEditing(null);
  };
  useEffect(() => {
    const loadAllEvents = async () => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      try {
        // Google Calendar connection status (FastAPI)
        let gcalConnected = false;
        try {
          const statusRes = await calendarApi.getGoogleStatus();
          gcalConnected = statusRes?.connected === true;
          setGoogleConnected(gcalConnected);
        } catch (_) {}

        // Google Calendar events for visible month (Option A: fetch by view to reduce latency)
        let formattedGoogleEvents = [];
        if (gcalConnected) {
          try {
            const timeMin = new Date(year, month, 1);
            const timeMax = new Date(year, month + 1, 0, 23, 59, 59, 999);
            const raw = await calendarApi.getGoogleEvents(timeMin.toISOString(), timeMax.toISOString());
            const googleItems = Array.isArray(raw) ? raw : [];
            formattedGoogleEvents = googleItems.map((item) => {
              const startObj = item.start || {};
              const endObj = item.end || {};
              const startRaw = startObj.dateTime ?? startObj.date_time ?? startObj.date;
              const endRaw = endObj.dateTime ?? endObj.date_time ?? endObj.date;
              const startDate = startRaw ? new Date(startRaw) : null;
              const endDate = endRaw ? new Date(endRaw) : null;
              if (!startDate || isNaN(startDate.getTime())) return null;
              const y = startDate.getFullYear();
              const m = String(startDate.getMonth() + 1).padStart(2, '0');
              const d = String(startDate.getDate()).padStart(2, '0');
              const dateStr = `${y}-${m}-${d}`;
              const hasTime = !!(startObj.dateTime ?? startObj.date_time);
              const timeStr = hasTime
                ? startDate.toTimeString().split(' ')[0].substring(0, 5)
                : '00:00';
              const durationMins = (endDate && !isNaN(endDate.getTime()) && hasTime)
                ? Math.max(1, Math.round((endDate - startDate) / 60000))
                : 60;
              return {
                id: `google-${item.id || Math.random().toString(36).slice(2)}`,
                title: item.summary || '(No title)',
                description: item.description || '',
                date: dateStr,
                time: timeStr,
                duration: durationMins,
                type: 'other',
                assignedTo: ['You'],
                source: 'google',
              };
            }).filter(Boolean);
          } catch (err) {
            console.error('Failed to fetch Google Calendar events:', err);
            formattedGoogleEvents = [];
          }
        }

        // Scheduled visits from FastAPI (IGV/B2B with visit_date)
        let scheduledVisits = [];
        try {
          scheduledVisits = await calendarApi.getScheduledVisits();
        } catch (_) {}

        const formattedScheduledVisits = (scheduledVisits || []).map(v => {
          const dateObj = new Date(v.visit_date);
          return {
            id: `visit-${v.source}-${v.id}`,
            title: v.company_name ? `Company visit: ${v.company_name}` : 'Company visit',
            description: '',
            date: dateObj.toISOString().split('T')[0],
            time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
            duration: 60,
            type: 'visit',
            assignedTo: ['You'],
            entityId: v.id,
            entityType: 'company',
            source: v.source,
            visitDate: v.visit_date
          };
        });

        // Load lead follow-ups and companies (existing sources)
        let formattedLeadFollowUps = [];
        let formattedCompanyVisits = [];
        let formattedCompanyFollowUps = [];
        try {
          const [followUpsResponse, companiesResponse] = await Promise.all([
            leadsApi.getFollowUpsCreatedBy(),
            marketResearchAPI.getCompanies()
          ]);

          formattedLeadFollowUps = (followUpsResponse.data || followUpsResponse)
            .filter(fu => fu.next_follow_up_date)
            .map(fu => {
              const dateObj = new Date(fu.next_follow_up_date);
              return {
                id: `lead-followup-${fu.id}`,
                title: 'Follow-up',
                description: fu.comment,
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
                duration: 60,
                assignedTo: [fu.created_by || 'You'],
                entityId: fu.ep_id,
                entityType: 'lead',
                status: fu.status || 'pending'
              };
            });

          formattedCompanyVisits = (companiesResponse || [])
            .filter(company => company.visitactualdate)
            .map(company => {
              const dateObj = new Date(company.visitactualdate);
              return {
                id: `visit-${company.id}`,
                title: 'Visit',
                description: company.visitnotes || 'Visit scheduled',
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
                duration: 60,
                assignedTo: [company.created_by || 'You'],
                entityId: company.id,
                entityType: 'company',
                status: company.visit || 'pending'
              };
            });

          formattedCompanyFollowUps = (companiesResponse || []).flatMap(company => {
            if (!company.followups || company.followups.length === 0) return [];
            return company.followups.map(fu => {
              const dateObj = new Date(fu.date);
              return {
                id: `company-followup-${fu.followUpID || fu.id}`,
                title: fu.title || 'Follow-up',
                description: fu.text || '',
                date: dateObj.toISOString().split('T')[0],
                time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
                duration: 60,
                assignedTo: [fu.author || 'You'],
                entityId: company.id,
                entityType: 'company',
                status: fu.status || 'pending',
                companyName: company.name,
                entityPhone: fu.entityPhone || company.personContact || '-'
              };
            });
          });

          // Merge company follow-ups from localStorage (e.g. from Market Research company cards / Podio)
          const seenIds = new Set(formattedCompanyFollowUps.map(e => e.id));
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('company_followups_')) continue;
            const companyId = key.replace('company_followups_', '');
            try {
              const list = JSON.parse(localStorage.getItem(key) || '[]');
              if (!Array.isArray(list)) continue;
              for (const fu of list) {
                const id = `company-followup-${fu.followUpID || fu.id}`;
                if (seenIds.has(id)) continue;
                seenIds.add(id);
                const dateObj = new Date(fu.date);
                formattedCompanyFollowUps.push({
                  id,
                  title: fu.title || 'Follow-up',
                  description: fu.text || '',
                  date: dateObj.toISOString().split('T')[0],
                  time: dateObj.toTimeString().split(' ')[0].substring(0, 5),
                  duration: 60,
                  assignedTo: [fu.author || 'You'],
                  entityId: fu.entityId || companyId,
                  entityType: 'company',
                  status: fu.status || 'pending',
                  companyName: fu.companyName || '',
                  entityPhone: fu.entityPhone || '-'
                });
              }
            } catch (_) {}
          }
        } catch (err) {
          console.error('Error loading follow-ups/companies:', err);
        }

        const allEvents = [
          ...formattedLeadFollowUps,
          ...formattedCompanyVisits,
          ...formattedScheduledVisits,
          ...formattedCompanyFollowUps
        ];
        setEvents(allEvents);

        // Push scheduled visits to Google Calendar when connected (once per visit)
        if (gcalConnected && formattedScheduledVisits.length > 0) {
          const pushed = JSON.parse(localStorage.getItem(CALENDAR_PUSHED_VISITS_KEY) || '[]');
          const toPush = formattedScheduledVisits.filter(ev => !pushed.includes(ev.id));
          for (const ev of toPush) {
            try {
              const start = new Date(ev.date + 'T' + ev.time + ':00');
              const end = new Date(start.getTime() + (ev.duration || 60) * 60 * 1000);
              await calendarApi.createGoogleEvent(ev.title, start.toISOString(), end.toISOString(), ev.description || '');
              pushed.push(ev.id);
            } catch (_) {}
          }
          if (toPush.length > 0) localStorage.setItem(CALENDAR_PUSHED_VISITS_KEY, JSON.stringify(pushed));
        }

        // Push company follow-up events to Google Calendar when connected (once per follow-up)
        if (gcalConnected && formattedCompanyFollowUps.length > 0) {
          const pushedFu = JSON.parse(localStorage.getItem(CALENDAR_PUSHED_FOLLOWUPS_KEY) || '[]');
          const toPushFu = formattedCompanyFollowUps.filter(ev => !pushedFu.includes(ev.id));
          for (const ev of toPushFu) {
            try {
              const start = new Date(ev.date + 'T' + (ev.time || '09:00') + ':00');
              const end = new Date(start.getTime() + (ev.duration || 60) * 60 * 1000);
              await calendarApi.createGoogleEvent(ev.title, start.toISOString(), end.toISOString(), ev.description || '');
              pushedFu.push(ev.id);
            } catch (_) {}
          }
          if (toPushFu.length > 0) localStorage.setItem(CALENDAR_PUSHED_FOLLOWUPS_KEY, JSON.stringify(pushedFu));
        }
      } catch (err) {
        console.error('Error loading calendar events:', err);
      }
    };

    loadAllEvents();
  }, [currentDate]);
  
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Error loading calendar data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      </Box>
    );
  }

  const handleConnectGoogle = () => {
    window.location.href = calendarApi.getConnectGoogleUrl();
  };

  return (
    <ErrorBoundary>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: { xs: 2, sm: 3 }, gap: { xs: 2, sm: 0 } }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
            Team Calendar
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}>
            {!googleConnected && (
              <Button
                variant="outlined"
                size="medium"
                onClick={handleConnectGoogle}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Connect Google Calendar
              </Button>
            )}
            {googleConnected && (
              <Chip label="Google Calendar connected" color="success" size="small" />
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Event
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 2, gap: { xs: 1, sm: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
              <IconButton onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ mx: { xs: 1, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {monthNames[currentMonth]} {currentYear}
              </Typography>
              <IconButton onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            
            <Button 
              variant="outlined" 
              startIcon={<TodayIcon />} 
              onClick={handleToday}
              size="small"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Today
            </Button>
          </Box>
          
          <CalendarGrid 
            events={events}
            month={currentMonth}
            year={currentYear}
            onEventClick={handleEventClick}
            onDeleteEvent={handleDeleteEvent}
          />
        </Paper>

        <EventForm
          open={formOpen}
          initial={editing}
          onSave={handleFormSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />

        <Snackbar
          open={!!googleMessage}
          autoHideDuration={5000}
          onClose={() => setGoogleMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setGoogleMessage(null)} severity={googleMessage?.includes('failed') ? 'error' : 'success'} sx={{ width: '100%' }}>
            {googleMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}

export default CalendarPage;
