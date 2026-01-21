import React from 'react';
import { Card, CardHeader, CardContent, Typography, Chip, Stack, Grid, Divider } from '@mui/material';
import { Fade } from '@mui/material';
import { AssignmentInd as AssignmentIndIcon, Person as PersonIcon, Phone as PhoneIcon, Work as WorkIcon, Link as LinkIcon } from '@mui/icons-material';
import { getStatusColor, getProductColor } from './utils';
import ApplicationTimeline from './ApplicationTimeline';

export default function ApplicationCard({ 
  app, 
  index, 
  theme
}) {
  const oppLink = app.opportunity?.id ? `https://aiesec.org/opportunity/${app.opportunity.id}` : null;

  return (
    <Fade in timeout={600 + index * 100}>
      <Card
        elevation={4}
        sx={{
          borderRadius: 4,
          bgcolor: 'white',
          transition: 'box-shadow 0.2s',
          boxShadow: '0 4px 24px rgba(40,60,90,0.10)',
          cursor: oppLink ? 'pointer' : 'default',
          '&:hover': {
            boxShadow: oppLink ? '0 8px 32px rgba(25,118,210,0.18)' : undefined,
            borderColor: oppLink ? theme.palette.primary.main : undefined,
            background: oppLink ? 'linear-gradient(90deg, #e3f2fd 0%, #f8fafc 100%)' : undefined,
          },
          width: '100%',
          px: 0,
          py: 0,
        }}
        onClick={() => {
          if (oppLink) window.open(oppLink, '_blank');
        }}
      >
        <CardHeader
          avatar={<AssignmentIndIcon color="primary" />}
          title={<Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>{app.opportunity?.title || '-'}</Typography>}
          subheader={<Stack direction="row" spacing={1}>
            <Chip label={app.status} color={getStatusColor(app.status)} size="small" sx={{ fontWeight: 700, fontSize: '0.95rem' }} />
            <Chip 
              label={app.opportunity?.programme?.short_name_display || '-'} 
              size="small" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem', 
                bgcolor: getProductColor(app.opportunity?.programme?.short_name_display, theme), 
                color: '#fff' 
              }} 
            />
          </Stack>}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 1, width: '100%', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
          <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
            {/* EP Info */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>EP Information</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="body1" fontWeight={700}>{app.person?.full_name || '-'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PhoneIcon color="primary" />
                <Typography variant="body2">{app.person?.contact_detail?.phone || '-'}</Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>EP ID: <b>{app.person?.id || '-'}</b></Typography>
              <Typography variant="body2">Application ID: <b>{app.id}</b></Typography>
            </Grid>

            {/* Opportunity Info */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Opportunity</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <WorkIcon color="primary" />
                <Typography variant="body1" fontWeight={700}>{app.opportunity?.title || '-'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LinkIcon color="primary" />
                <a 
                  href={app.person?.cvs?.[0]?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: theme.palette.primary.main, 
                    fontWeight: 600, 
                    textDecoration: 'underline' 
                  }} 
                  onClick={e => e.stopPropagation()}
                >
                  CV Link
                </a>
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>OP ID: <b>{app.opportunity?.id || '-'}</b></Typography>
              <Typography variant="body2">Sub-product: <b>{app.opportunity?.sub_product?.name || '-'}</b></Typography>
            </Grid>

            {/* Home/Host Info */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Home & Host Info</Typography>
              <Typography variant="body2">Home LC: <b>{app.person?.home_lc?.name || '-'}</b></Typography>
              <Typography variant="body2">Home MC: <b>{app.person?.home_mc?.name || '-'}</b></Typography>
              <Typography variant="body2">Host LC: <b>{app.opportunity?.host_lc?.name || '-'}</b></Typography>
              <Typography variant="body2">Host MC: <b>{app.opportunity?.home_mc?.name || '-'}</b></Typography>
            </Grid>

            {/* Timeline as Stepper */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.5 }}>Timeline</Typography>
              <ApplicationTimeline app={app} theme={theme} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );
}

