import { useState, useCallback } from 'react';

export function useInterviewHandlers() {
  const [interviewData, setInterviewData] = useState({});

  const handleInterviewedChange = useCallback((appId, value, currentData) => {
    setInterviewData(prev => {
      const updatedData = {
        ...prev,
        [appId]: {
          ...currentData,
          interviewed: value,
          interviewStatus: value !== 'Yes' ? '' : (currentData?.interviewStatus || ''),
          rejectionReason: value !== 'Yes' ? '' : (currentData?.rejectionReason || '')
        }
      };
      
      // Auto-save to localStorage
      const interviewEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        applicationId: appId,
        interviewed: value,
        interviewStatus: value !== 'Yes' ? '' : (currentData?.interviewStatus || ''),
        rejectionReason: value !== 'Yes' ? '' : (currentData?.rejectionReason || ''),
        author: 'Current User'
      };
      localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
      
      return updatedData;
    });
  }, []);
unlink

  const handleInterviewStatusChange = useCallback((appId, value, currentData) => {
    setInterviewData(prev => {
      const updatedData = {
        ...prev,
        [appId]: {
          ...currentData,
          interviewStatus: value,
          rejectionReason: value !== 'Rejected' ? '' : (currentData?.rejectionReason || '')
        }
      };
      
      // Auto-save to localStorage
      const interviewEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        applicationId: appId,
        interviewed: currentData?.interviewed || '',
        interviewStatus: value,
        rejectionReason: value !== 'Rejected' ? '' : (currentData?.rejectionReason || ''),
        author: 'Current User'
      };
      localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
      
      return updatedData;
    });
  }, []);
unlink

  const handleRejectionReasonChange = useCallback((appId, value, currentData) => {
    setInterviewData(prev => {
      const updatedData = {
        ...prev,
        [appId]: {
          ...currentData,
          rejectionReason: value
        }
      };
      
      // Auto-save to localStorage
      const interviewEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        applicationId: appId,
        interviewed: currentData?.interviewed || '',
        interviewStatus: currentData?.interviewStatus || '',
        rejectionReason: value,
        author: 'Current User'
      };
      localStorage.setItem(`application_interview_status_${appId}`, JSON.stringify(interviewEntry));
      
      return updatedData;
    });
  }, []);
unlink

  const loadInterviewData = useCallback((apps) => {
    const loadedData = {};
    apps.forEach(app => {
      const storedData = localStorage.getItem(`application_interview_status_${app.id}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        loadedData[app.id] = {
          interviewed: parsedData.interviewed || '',
          interviewStatus: parsedData.interviewStatus || '',
          rejectionReason: parsedData.rejectionReason || ''
        };
      }
    });
    setInterviewData(loadedData);
  }, []);
unlink

  return {
    interviewData,
    setInterviewData,
    handleInterviewedChange,
    handleInterviewStatusChange,
    handleRejectionReasonChange,
    loadInterviewData
  };
}

