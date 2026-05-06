import React from 'react'
import type { ReactNode } from "react";
import { useState } from "react";

import { DashboardContext } from './Context'

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [tabValue, setTab] = useState(0);
  return (
    <DashboardContext.Provider value={{ tabValue, setTab }}>
      {children}
    </DashboardContext.Provider>
  );
};