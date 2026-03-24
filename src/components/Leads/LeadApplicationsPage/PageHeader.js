import React from 'react';
import { Box } from '@mui/material';
import PageBreadcrumbs from '../../Navigation/PageBreadcrumbs';

export default function PageHeader({ onBack }) {
  return (
    <Box sx={{
      width: '100%',
      bgcolor: 'background.default',
      px: { xs: 2, md: 6 },
      py: { xs: 2, md: 3 },
      mb: 2,
    }}>
      <PageBreadcrumbs 
        items={[
          { label: 'Leads', path: '/leads' },
          { label: 'Opportunity Applications' }
        ]}
        onBack={onBack}
        title="Opportunity Applications"
      />
    </Box>
  );
}
