import React, { createContext, useState, useContext } from 'react';

const CRMTypeContext = createContext();

export const CRMTypeProvider = ({ children }) => {
  const [crmType, setCrmType] = useState('oGX'); // Default to oGX

  const toggleCRMType = () => {
    setCrmType(prevType => {
      if (prevType === 'oGX') return 'iCX';
      if (prevType === 'iCX') return 'B2C';
      return 'oGX';
    });
  };

  const setCRMType = (type) => setCrmType(type);

  return (
    <CRMTypeContext.Provider value={{ crmType, toggleCRMType, setCRMType }}>
      {children}
    </CRMTypeContext.Provider>
  );
};

export const useCRMType = () => useContext(CRMTypeContext); 