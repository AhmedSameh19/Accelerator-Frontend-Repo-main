import { AIESEC_STEPS } from './constants';

// Get current AIESEC status step
export const getCurrentStep = (leadStatus) => {
  const currentStatus = (leadStatus || '').toLowerCase() || 'open';
  return AIESEC_STEPS.findIndex(step => step.label.toLowerCase() === currentStatus);
};

// Check if step should be colored
export const isStepActive = (stepIndex, leadStatus) => {
  const currentStep = getCurrentStep(leadStatus);
  return stepIndex <= currentStep;
};

// Status colors for different states
export const getStepStyle = (stepIndex, currentStepIndex) => {
  if (stepIndex <= currentStepIndex) {
    return {
      '& .MuiStepLabel-label': {
        color: '#037ef3', // AIESEC Blue
        fontWeight: 'bold'
      },
      '& .MuiStepIcon-root': {
        color: '#037ef3'
      },
      '& .MuiStepIcon-text': {
        fill: 'white'
      },
      '& .MuiStepConnector-line': {
        borderColor: '#037ef3'
      }
    };
  }
  return {};
};

