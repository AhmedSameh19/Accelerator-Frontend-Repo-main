import React from 'react';
import { Paper, Grid, Typography, Box, Chip } from '@mui/material';
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { InfoItem } from './InfoItem';

export function LeadPersonalInfo({ lead, leadName }) {
  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 1, sm: 2.5 }, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      mb: { xs: 1, sm: 2 }, 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: { xs: 1, sm: 2 }, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        fontSize: { xs: '0.9rem', sm: '1.25rem' } 
      }}>
        <PersonIcon color="primary" /> Personal Information
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} sm={6}>
          <InfoItem icon={<PersonIcon color="primary" />} label="Name" value={leadName} />
          <InfoItem icon={<EmailIcon color="primary" />} label="Email" value={lead.email} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem icon={<PersonIcon color="primary" />} label="Gender" value={lead.gender} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem icon={<CalendarIcon color="primary" />} label="DOB" value={lead.dob} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem icon={<PhoneIcon color="primary" />} label="Phone" value={lead.phone} />
        </Grid>
      </Grid>
    </Paper>
  );
}

export function LeadAIESECInfo({ lead, leadStatus }) {
  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 1, sm: 2.5 }, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      mb: { xs: 1, sm: 2 }, 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: { xs: 1, sm: 2 }, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        fontSize: { xs: '0.9rem', sm: '1.25rem' } 
      }}>
        <WorkIcon fontSize="medium" color="action" /> AIESEC Information
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} sm={6}>
          <InfoItem 
            icon={<PersonIcon color="primary" />} 
            label="Person Status" 
            value={
              <Chip 
                label={leadStatus || '-'} 
                color="primary" 
                size="small" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }, 
                  height: { xs: '16px', sm: '20px' } 
                }} 
              />
            } 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem icon={<CalendarIcon color="primary" />} label="Signed up at" value={lead.created_at} />
        </Grid>
      </Grid>
    </Paper>
  );
}

export function LeadEducationInfo({ lead }) {
  return (
    <Paper elevation={1} sx={{ 
      p: { xs: 1, sm: 2.5 }, 
      borderRadius: 3, 
      bgcolor: '#f8fafc', 
      mb: { xs: 1, sm: 2 }, 
      boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
    }}>
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: { xs: 1, sm: 2 }, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        fontSize: { xs: '0.9rem', sm: '1.25rem' } 
      }}>
        <SchoolIcon fontSize="medium" color="action" /> Education
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} sm={6}>
          <InfoItem 
            icon={<SchoolIcon color="primary" />} 
            label="Backgrounds" 
            value={lead.academic_backgrounds?.[0] || lead.backgrounds || '-'} 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoItem 
            icon={<SchoolIcon color="primary" />} 
            label="Latest Graduation Year" 
            value={lead.latest_graduation_date || '-'} 
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export function LeadOpportunityInfo({ lead, opportunitySectionRef }) {
  return (
    <Paper 
      ref={opportunitySectionRef}
      elevation={1} 
      sx={{ 
        p: { xs: 1, sm: 2.5 }, 
        borderRadius: 3, 
        bgcolor: '#f8fafc', 
        mb: { xs: 1, sm: 2 }, 
        boxShadow: '0 1px 4px rgba(40,60,90,0.04)' 
      }}
    >
      <Typography variant="h6" sx={{ 
        color: 'primary.main', 
        fontWeight: 700, 
        mb: { xs: 1, sm: 2 }, 
        letterSpacing: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        fontSize: { xs: '0.9rem', sm: '1.25rem' } 
      }}>
        <WorkIcon fontSize="medium" color="action" /> Opportunity
      </Typography>
      <Grid container spacing={0.5}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              Applications
            </Typography>
            <Typography variant="h5" sx={{ 
              fontWeight: 800, 
              color: 'primary.main', 
              ml: 1, 
              fontSize: { xs: '1.1rem', sm: '1.5rem' } 
            }}>
              {lead.opportunity_applications_count || 0}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

