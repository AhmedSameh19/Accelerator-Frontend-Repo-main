import React from 'react';
import { Stepper, Step, StepLabel, Typography } from '@mui/material';

export default function ApplicationTimeline({ app, theme }) {
  const timelineSteps = [
    { label: 'Signed Up', date: app.person?.created_at },
    { label: 'Applied', date: app.created_at },
    { label: 'Accepted', date: app.date_matched },
    { label: 'Approved', date: app.date_approved },
    { label: 'Realized', date: app.date_realized },
    { label: 'Finished', date: app.experience_end_date }
  ];

  const activeStep = timelineSteps.filter(step => step.date).length - 1;

  return (
    <Stepper alternativeLabel activeStep={activeStep} sx={{ mb: 2 }}>
      {timelineSteps.map((step) => (
        <Step key={step.label} completed={!!step.date}>
          <StepLabel
            StepIconProps={{
              style: {
                color: step.date ? theme.palette.primary.main : '#bdbdbd',
                fontWeight: 700
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{step.label}</Typography>
            <Typography variant="caption" color="text.secondary">
              {step.date ? new Date(step.date).toLocaleDateString() : ''}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

