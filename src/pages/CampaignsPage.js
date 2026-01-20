import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions, Grid,
  Chip, LinearProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  People as PeopleIcon, DateRange as DateRangeIcon
} from '@mui/icons-material';

// Sample campaigns data
const initialCampaigns = [
  {
    id: 1,
    name: 'BIS 22/4/2025 - 25/4/2025',
    description: 'oGX SUs',
    status: 'active',
    leadsCount: 45,
    goal: 60,
    startDate: '2025-04-22',
    endDate: '2025-04-25',
    tags: ['oGX', 'Summer']
  },
  {
    id: 2,
    name: 'RCR',
    description: 'Recruitment SUs',
    status: 'active',
    leadsCount: 28,
    goal: 50,
    startDate: '2025-04-15',
    endDate: '2025-05-30',
    tags: ['Recruitment']
  },
  {
    id: 3,
    name: 'Partner Info Sessions',
    description: 'Information sessions at LingoEDX',
    status: 'planned',
    leadsCount: 0,
    goal: 40,
    startDate: '2025-06-15',
    endDate: '2025-07-15',
    tags: ['Partner']
  }
];

function CampaignForm({ open, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planned',
    goal: 50,
    startDate: '',
    endDate: '',
    tags: ''
  });

  React.useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        description: initial.description || '',
        status: initial.status || 'planned',
        goal: initial.goal || 50,
        startDate: initial.startDate || '',
        endDate: initial.endDate || '',
        tags: initial.tags ? initial.tags.join(', ') : ''
      });
    } else {
      setForm({
        name: '',
        description: '',
        status: 'planned',
        goal: 50,
        startDate: '',
        endDate: '',
        tags: ''
      });
    }
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const formattedData = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    onSave(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <TextField
            label="Campaign Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField
            label="Goal (Leads)"
            name="goal"
            type="number"
            value={form.goal}
            onChange={handleChange}
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Tags (comma separated)"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            fullWidth
            placeholder="e.g. oGX, Summer, University"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save Campaign</Button>
      </DialogActions>
    </Dialog>
  );
}

function CampaignCard({ campaign, onEdit, onDelete }) {
  const progress = Math.min(100, Math.round((campaign.leadsCount / campaign.goal) * 100));
  
  const statusColor = {
    active: 'success',
    planned: 'info',
    paused: 'warning',
    completed: 'secondary'
  }[campaign.status];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div">
            {campaign.name}
          </Typography>
          <Chip 
            label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)} 
            color={statusColor} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          {campaign.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {campaign.leadsCount} / {campaign.goal} leads
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            mb: 2,
            bgcolor: 'background.default',
            '& .MuiLinearProgress-bar': {
              bgcolor: progress >= 100 ? 'success.main' : 'primary.main'
            }
          }} 
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {campaign.startDate} to {campaign.endDate}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {campaign.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'background.default' }} />
          ))}
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(campaign)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(campaign.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleAddClick = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (campaign) => {
    setEditing(campaign);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    }
  };

  const handleFormSave = (formData) => {
    if (editing) {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === editing.id ? { ...campaign, ...formData } : campaign
      ));
    } else {
      const newCampaign = {
        id: Math.max(0, ...campaigns.map(c => c.id)) + 1,
        leadsCount: 0,
        ...formData
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }
    setFormOpen(false);
  };

  return (
    <Box>
      {/* Coming Soon Banner */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 3, 
        borderRadius: 2, 
        mb: 3,
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <img 
            src="/assets/images/Accelerator logo.png" 
            alt="Accelerator Logo" 
            style={{ 
              width: '40px', 
              height: '40px', 
              marginRight: '12px'
            }} 
          />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Campaigns Management Coming Soon!
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          We're working on an enhanced campaign management system. For now, you can view the existing campaigns below.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Current Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          New Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        {campaigns.map(campaign => (
          <Grid item xs={12} sm={6} md={4} key={campaign.id}>
            <CampaignCard 
              campaign={campaign} 
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Grid>
        ))}
      </Grid>

      <CampaignForm
        open={formOpen}
        initial={editing}
        onSave={handleFormSave}
        onClose={() => setFormOpen(false)}
      />
    </Box>
  );
}

export default CampaignsPage;
